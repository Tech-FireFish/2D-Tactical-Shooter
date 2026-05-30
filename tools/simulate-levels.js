"use strict";

const fs = require("fs");
const path = require("path");

const UNIT_RADIUS = 12;
const TWO_PI = Math.PI * 2;
const DT = 1 / 30;
const CELL = 10;
const LEVEL_FILES = [
  "ridge-house-entry.json",
  "warehouse-pinch.json",
  "hardpoint-gallery.json"
];

function cloneLevel(level) {
  return {
    id: level.id,
    title: level.title,
    walls: level.walls.map((wall) => ({ ...wall })),
    doors: level.doors.map((door) => ({ ...door })),
    operators: level.operators.map((op) => ({
      ...op,
      radius: UNIT_RADIUS,
      health: 100,
      speed: 92,
      path: [],
      aim: 0,
      action: null,
      reaction: 0,
      targetId: null,
      down: false
    })),
    enemies: level.enemies.map((enemy) => ({
      ...enemy,
      radius: 12,
      health: 100,
      speed: 34,
      sightRange: 190,
      fov: Math.PI * 0.78,
      reaction: 0,
      targetId: null,
      down: false,
      patrolIndex: 0
    })),
    objective: { ...level.objective }
  };
}

function pointDistance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function normalizeAngle(angle) {
  let out = angle;
  while (out <= -Math.PI) out += TWO_PI;
  while (out > Math.PI) out -= TWO_PI;
  return out;
}

function angleTo(a, b) {
  return Math.atan2(b.y - a.y, b.x - a.x);
}

function circleRectCollides(circle, rect, padding = 0) {
  const closestX = clamp(circle.x, rect.x - padding, rect.x + rect.w + padding);
  const closestY = clamp(circle.y, rect.y - padding, rect.y + rect.h + padding);
  const dx = circle.x - closestX;
  const dy = circle.y - closestY;
  return dx * dx + dy * dy <= circle.radius * circle.radius;
}

function pointRectDistance(point, rect) {
  const closestX = clamp(point.x, rect.x, rect.x + rect.w);
  const closestY = clamp(point.y, rect.y, rect.y + rect.h);
  return Math.hypot(point.x - closestX, point.y - closestY);
}

function pointInRect(point, rect) {
  return point.x >= rect.x
    && point.x <= rect.x + rect.w
    && point.y >= rect.y
    && point.y <= rect.y + rect.h;
}

function lineSegmentsIntersect(a, b, c, d) {
  const det = (b.x - a.x) * (d.y - c.y) - (b.y - a.y) * (d.x - c.x);
  if (Math.abs(det) < 0.0001) return false;
  const lambda = ((d.y - c.y) * (d.x - a.x) + (c.x - d.x) * (d.y - a.y)) / det;
  const gamma = ((a.y - b.y) * (d.x - a.x) + (b.x - a.x) * (d.y - a.y)) / det;
  return lambda >= 0 && lambda <= 1 && gamma >= 0 && gamma <= 1;
}

function segmentIntersectsRect(a, b, rect) {
  if (pointInRect(a, rect) || pointInRect(b, rect)) return true;
  const r1 = { x: rect.x, y: rect.y };
  const r2 = { x: rect.x + rect.w, y: rect.y };
  const r3 = { x: rect.x + rect.w, y: rect.y + rect.h };
  const r4 = { x: rect.x, y: rect.y + rect.h };
  return lineSegmentsIntersect(a, b, r1, r2)
    || lineSegmentsIntersect(a, b, r2, r3)
    || lineSegmentsIntersect(a, b, r3, r4)
    || lineSegmentsIntersect(a, b, r4, r1);
}

function doorBlocks(door) {
  return door.state === "closed";
}

function blockingRects(level) {
  return [
    ...level.walls,
    ...level.doors.filter(doorBlocks)
  ];
}

function collidesWithMap(level, circle) {
  return blockingRects(level).some((rect) => circleRectCollides(circle, rect));
}

function collidesWithWalls(level, circle) {
  return level.walls.some((rect) => circleRectCollides(circle, rect));
}

function hasLineOfSight(a, b, level) {
  return !blockingRects(level).some((rect) => segmentIntersectsRect(a, b, rect));
}

function inFieldOfView(observer, target) {
  if (pointDistance(observer, target) > observer.sightRange) return false;
  const delta = Math.abs(normalizeAngle(angleTo(observer, target) - observer.angle));
  return delta <= observer.fov / 2;
}

function inflateRect(rect, amount) {
  return {
    x: rect.x - amount,
    y: rect.y - amount,
    w: rect.w + amount * 2,
    h: rect.h + amount * 2
  };
}

function nearestClosedDoorOnRoute(level, op, next) {
  let best = null;
  let bestDist = Infinity;
  for (const door of level.doors) {
    if (!doorBlocks(door)) continue;
    const crossing = segmentIntersectsRect({ x: op.x, y: op.y }, next, inflateRect(door, 8));
    const distance = pointRectDistance(op, door);
    const close = distance < 38;
    if ((crossing || close) && close && distance < bestDist) {
      best = door;
      bestDist = distance;
    }
  }
  return best;
}

function tryOpenDoor(op, door) {
  if (!door || !doorBlocks(door)) return false;
  if (!op.action) {
    op.action = { type: "breach", doorId: door.id, timer: 0.34 };
  }
  return true;
}

function damageEnemy(enemy, amount) {
  enemy.health -= amount;
  if (enemy.health <= 0) {
    enemy.health = 0;
    enemy.down = true;
    enemy.targetId = null;
  }
}

function damageOperator(op, amount) {
  op.health -= amount;
  if (op.health <= 0) {
    op.health = 0;
    op.down = true;
    op.path = [];
    op.action = null;
  }
}

function updateOperator(level, op, dt) {
  if (op.down) return;
  if (op.action) {
    op.action.timer -= dt;
    if (op.action.timer <= 0) {
      const door = level.doors.find((item) => item.id === op.action.doorId);
      if (door) door.state = "breached";
      op.action = null;
    }
    return;
  }

  const target = op.path[0];
  if (!target) return;

  const door = nearestClosedDoorOnRoute(level, op, target);
  if (door && tryOpenDoor(op, door)) return;

  const dist = pointDistance(op, target);
  if (dist < 4) {
    op.path.shift();
    return;
  }

  const direction = angleTo(op, target);
  op.aim = direction;
  const step = Math.min(dist, op.speed * dt);
  const next = {
    x: op.x + Math.cos(direction) * step,
    y: op.y + Math.sin(direction) * step,
    radius: op.radius
  };

  if (!collidesWithMap(level, next)) {
    op.x = next.x;
    op.y = next.y;
  }
}

function updateOperatorCombat(level, op, dt) {
  if (op.down) return;
  const visible = level.enemies
    .filter((enemy) => !enemy.down)
    .filter((enemy) => pointDistance(op, enemy) < 210)
    .filter((enemy) => hasLineOfSight(op, enemy, level))
    .sort((a, b) => pointDistance(op, a) - pointDistance(op, b));

  const target = visible[0];
  if (!target) {
    op.targetId = null;
    op.reaction = Math.max(0, op.reaction - dt * 0.9);
    return;
  }

  op.targetId = target.id;
  op.aim = angleTo(op, target);
  op.reaction += dt;
  if (op.reaction > 0.42) {
    damageEnemy(target, 38);
    op.reaction = 0.04;
  }
}

function updateEnemy(level, enemy, dt) {
  if (enemy.down) return;
  const liveOps = level.operators.filter((op) => !op.down);
  const seen = liveOps.find((op) => inFieldOfView(enemy, op) && hasLineOfSight(enemy, op, level));
  if (seen) {
    enemy.targetId = seen.id;
    enemy.reaction += dt;
    enemy.angle = angleTo(enemy, seen);
    if (enemy.reaction > 0.7) {
      damageOperator(seen, 34);
      enemy.reaction = 0.1;
    }
    return;
  }

  enemy.targetId = null;
  enemy.reaction = Math.max(0, enemy.reaction - dt * 0.8);
  updateEnemyPatrol(level, enemy, dt);
}

function updateEnemyPatrol(level, enemy, dt) {
  if (!enemy.patrol || enemy.patrol.length < 2) return;
  const target = enemy.patrol[enemy.patrolIndex];
  const dist = pointDistance(enemy, target);
  if (dist < 5) {
    enemy.patrolIndex = (enemy.patrolIndex + 1) % enemy.patrol.length;
    return;
  }
  const direction = angleTo(enemy, target);
  enemy.angle = direction;
  const next = {
    x: enemy.x + Math.cos(direction) * enemy.speed * dt,
    y: enemy.y + Math.sin(direction) * enemy.speed * dt,
    radius: enemy.radius
  };
  if (!collidesWithMap(level, next)) {
    enemy.x = next.x;
    enemy.y = next.y;
  }
}

function updateObjective(level) {
  if (level.objective.secured || level.objective.harmed) return;
  if (level.operators.some((op) => !op.down && pointDistance(op, level.objective) < 34)) {
    level.objective.secured = true;
  }
}

function simplifyPath(points) {
  if (points.length <= 2) return points;
  const out = [points[0]];
  for (let i = 1; i < points.length - 1; i += 1) {
    const a = out[out.length - 1];
    const b = points[i];
    const c = points[i + 1];
    const cross = (b.x - a.x) * (c.y - b.y) - (b.y - a.y) * (c.x - b.x);
    if (Math.abs(cross) > 0.001) out.push(b);
  }
  out.push(points[points.length - 1]);
  return out;
}

function findPath(level, start, goal) {
  const cols = Math.floor(960 / CELL);
  const rows = Math.floor(640 / CELL);
  const key = (c, r) => `${c},${r}`;
  const toCell = (p) => ({
    c: clamp(Math.round(p.x / CELL), 0, cols - 1),
    r: clamp(Math.round(p.y / CELL), 0, rows - 1)
  });
  const toPoint = (c, r) => ({ x: c * CELL, y: r * CELL });
  const pass = (c, r) => {
    const point = toPoint(c, r);
    return !collidesWithWalls(level, { x: point.x, y: point.y, radius: UNIT_RADIUS });
  };

  const startCell = toCell(start);
  const goalCell = toCell(goal);
  const open = [startCell];
  const came = new Map();
  const g = new Map([[key(startCell.c, startCell.r), 0]]);
  const f = new Map([[
    key(startCell.c, startCell.r),
    pointDistance(toPoint(startCell.c, startCell.r), toPoint(goalCell.c, goalCell.r))
  ]]);
  const closed = new Set();
  const dirs = [
    [1, 0], [-1, 0], [0, 1], [0, -1],
    [1, 1], [1, -1], [-1, 1], [-1, -1]
  ];

  while (open.length) {
    open.sort((a, b) => (f.get(key(a.c, a.r)) ?? Infinity) - (f.get(key(b.c, b.r)) ?? Infinity));
    const cur = open.shift();
    const curKey = key(cur.c, cur.r);
    if (cur.c === goalCell.c && cur.r === goalCell.r) {
      const cells = [];
      let nodeKey = curKey;
      while (nodeKey) {
        const [c, r] = nodeKey.split(",").map(Number);
        cells.push(toPoint(c, r));
        nodeKey = came.get(nodeKey);
      }
      return simplifyPath(cells.reverse().concat([goal]));
    }

    closed.add(curKey);
    for (const [dc, dr] of dirs) {
      const nc = cur.c + dc;
      const nr = cur.r + dr;
      const nextKey = key(nc, nr);
      if (nc < 0 || nr < 0 || nc >= cols || nr >= rows || closed.has(nextKey) || !pass(nc, nr)) {
        continue;
      }

      const tentative = (g.get(curKey) ?? Infinity) + Math.hypot(dc, dr);
      if (tentative < (g.get(nextKey) ?? Infinity)) {
        came.set(nextKey, curKey);
        g.set(nextKey, tentative);
        f.set(nextKey, tentative + pointDistance(toPoint(nc, nr), goal));
        if (!open.some((node) => node.c === nc && node.r === nr)) {
          open.push({ c: nc, r: nr });
        }
      }
    }
  }

  return null;
}

function simulate(levelRaw) {
  const level = cloneLevel(levelRaw);
  const enemyReachability = level.enemies.map((enemy) => ({
    id: enemy.id,
    reachable: level.operators.some((op) => Boolean(findPath(level, op, enemy)))
  }));

  for (const op of level.operators) {
    const route = findPath(level, op, level.objective);
    if (!route) return { result: "no-path", title: level.title, op: op.id };
    op.path = route.slice(1);
  }

  let result = "timeout";
  let t = 0;
  for (let step = 0; step < 45 / DT; step += 1) {
    t += DT;
    for (const op of level.operators) updateOperator(level, op, DT);
    for (const op of level.operators) updateOperatorCombat(level, op, DT);
    for (const enemy of level.enemies) updateEnemy(level, enemy, DT);
    updateObjective(level);

    const liveOps = level.operators.some((op) => !op.down);
    const allEnemiesDown = level.enemies.every((enemy) => enemy.down);
    if (level.objective.secured || allEnemiesDown) {
      result = "success";
      break;
    }
    if (!liveOps || level.objective.harmed) {
      result = "failure";
      break;
    }
  }

  return {
    result,
    title: level.title,
    t: Number(t.toFixed(2)),
    objective: level.objective.secured,
    enemiesDown: `${level.enemies.filter((enemy) => enemy.down).length}/${level.enemies.length}`,
    enemyReachability,
    operators: level.operators.map((op) => ({
      id: op.id,
      hp: Number(op.health.toFixed(1)),
      down: op.down,
      x: Number(op.x.toFixed(1)),
      y: Number(op.y.toFixed(1)),
      remainingWaypoints: op.path.length
    })),
    doors: level.doors.map((door) => ({ id: door.id, state: door.state }))
  };
}

let failed = false;
for (const file of LEVEL_FILES) {
  const level = JSON.parse(fs.readFileSync(path.join("level", file), "utf8"));
  const result = simulate(level);
  console.log(JSON.stringify(result, null, 2));
  if (result.result !== "success") failed = true;
}

process.exitCode = failed ? 1 : 0;
