"use strict";

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const levelTitle = document.getElementById("levelTitle");
const levelSelect = document.getElementById("levelSelect");
const modeLabel = document.getElementById("modeLabel");
const clockLabel = document.getElementById("clockLabel");
const objectiveLabel = document.getElementById("objectiveLabel");
const runButton = document.getElementById("runButton");
const restartButton = document.getElementById("restartButton");
const debugButton = document.getElementById("debugButton");
const banner = document.getElementById("banner");
const bannerTitle = document.getElementById("bannerTitle");
const bannerText = document.getElementById("bannerText");
const nextLevelButton = document.getElementById("nextLevelButton");
const bannerRestartButton = document.getElementById("bannerRestartButton");

const WORLD = { w: 960, h: 640 };
const TWO_PI = Math.PI * 2;
const UNIT_RADIUS = 12;
const MANUAL_KEYS = new Set(["w", "a", "s", "d"]);

const colors = {
  floor: "#1a1f1f",
  floorAlt: "#202626",
  grid: "rgba(255,255,255,0.035)",
  wall: "#596369",
  wallEdge: "#2a3033",
  doorClosed: "#e0af56",
  doorOpen: "#70c58d",
  success: "#60c689",
  path: "#79c7dd",
  op: "#68c98f",
  opDark: "#173f2a",
  enemy: "#df6262",
  hostage: "#ebd36b",
  text: "#eef3ef",
  muted: "#9ca79f",
  sight: "rgba(226,95,95,0.13)",
  opSight: "rgba(103,201,143,0.12)",
  selected: "#ffffff"
};

let state;
let currentLevel;
let currentLevelMeta;
let lastTime = performance.now();
const keysDown = new Set();

const LEVEL_OPTIONS = [
  { id: "ridge-house-entry", title: "Ridge House Entry", file: "level/ridge-house-entry.json" },
  { id: "warehouse-pinch", title: "Warehouse Pinch", file: "level/warehouse-pinch.json" },
  { id: "hardpoint-gallery", title: "Hardpoint Gallery", file: "level/hardpoint-gallery.json" }
];

function createGameState(level) {
  const firstOperator = level.operators[0];
  return {
    running: false,
    gameOver: false,
    result: null,
    debug: false,
    selectedId: firstOperator ? firstOperator.id : null,
    // Clock progression is disabled by request; mission rules no longer depend on elapsed time.
    // clock: 0,
    message: "Draw routes, then execute",
    shots: [],
    level: cloneLevel(level)
  };
}

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
      down: false,
      routeIndex: 0
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

function restart() {
  if (!currentLevel) return;
  keysDown.clear();
  state = createGameState(currentLevel);
  lastTime = performance.now();
  banner.classList.add("hidden");
  levelTitle.textContent = currentLevel.title || currentLevelMeta.title;
  updateHud();
}

function currentLevelIndex() {
  return Math.max(0, LEVEL_OPTIONS.findIndex((level) => level.id === currentLevelMeta.id));
}

function populateLevelSelect() {
  levelSelect.innerHTML = "";
  for (const level of LEVEL_OPTIONS) {
    const option = document.createElement("option");
    option.value = level.id;
    option.textContent = level.title;
    levelSelect.append(option);
  }
}

async function loadLevel(levelId) {
  const meta = LEVEL_OPTIONS.find((level) => level.id === levelId) || LEVEL_OPTIONS[0];
  currentLevelMeta = meta;
  levelSelect.value = meta.id;
  levelSelect.disabled = true;
  levelTitle.textContent = "Loading...";

  try {
    const response = await fetch(meta.file, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`Unable to load ${meta.file}: ${response.status}`);
    }
    currentLevel = await response.json();
    currentLevel.id = currentLevel.id || meta.id;
    currentLevel.title = currentLevel.title || meta.title;
    restart();
  } catch (error) {
    currentLevel = null;
    state = null;
    levelTitle.textContent = "Level Load Failed";
    bannerTitle.textContent = "Level Load Failed";
    bannerText.textContent = error.message;
    banner.classList.remove("hidden");
  } finally {
    levelSelect.disabled = false;
  }
}

function loadNextLevel() {
  if (!currentLevelMeta) return;
  const nextIndex = (currentLevelIndex() + 1) % LEVEL_OPTIONS.length;
  loadLevel(LEVEL_OPTIONS[nextIndex].id);
}

function toggleRun() {
  if (!state) return;
  if (state.gameOver) return;
  state.running = !state.running;
  state.message = state.running ? "Execute" : "Planning";
  updateHud();
}

function hasManualInput() {
  return [...MANUAL_KEYS].some((key) => keysDown.has(key));
}

function selectedOperator() {
  if (!state) return null;
  return state.level.operators.find((op) => op.id === state.selectedId);
}

function getMouseWorld(event) {
  const rect = canvas.getBoundingClientRect();
  const sx = canvas.width / rect.width;
  const sy = canvas.height / rect.height;
  return {
    x: (event.clientX - rect.left) * sx,
    y: (event.clientY - rect.top) * sy
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

function rectCenter(rect) {
  return { x: rect.x + rect.w / 2, y: rect.y + rect.h / 2 };
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

function pointInRect(point, rect) {
  return point.x >= rect.x && point.x <= rect.x + rect.w && point.y >= rect.y && point.y <= rect.y + rect.h;
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

function lineSegmentsIntersect(a, b, c, d) {
  const det = (b.x - a.x) * (d.y - c.y) - (b.y - a.y) * (d.x - c.x);
  if (Math.abs(det) < 0.0001) return false;
  const lambda = ((d.y - c.y) * (d.x - a.x) + (c.x - d.x) * (d.y - a.y)) / det;
  const gamma = ((a.y - b.y) * (d.x - a.x) + (b.x - a.x) * (d.y - a.y)) / det;
  return lambda >= 0 && lambda <= 1 && gamma >= 0 && gamma <= 1;
}

function hasLineOfSight(a, b, level) {
  const blockers = [
    ...level.walls,
    ...level.doors.filter(doorBlocks)
  ];
  return !blockers.some((rect) => segmentIntersectsRect(a, b, rect));
}

function inFieldOfView(observer, target) {
  const distance = pointDistance(observer, target);
  if (distance > observer.sightRange) return false;
  const delta = Math.abs(normalizeAngle(angleTo(observer, target) - observer.angle));
  return delta <= observer.fov / 2;
}

function nearestClosedDoorOnRoute(op, next) {
  let best = null;
  let bestDist = Infinity;
  for (const door of state.level.doors) {
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

function inflateRect(rect, amount) {
  return {
    x: rect.x - amount,
    y: rect.y - amount,
    w: rect.w + amount * 2,
    h: rect.h + amount * 2
  };
}

function tryOpenDoor(op, door) {
  if (!door || !doorBlocks(door)) return false;
  if (!op.action) {
    op.action = { type: "breach", doorId: door.id, timer: 0.34 };
    state.message = `${op.id} breaching`;
  }
  return true;
}

function updateOperator(op, dt) {
  if (op.down) return;
  if (op.action) {
    op.action.timer -= dt;
    if (op.action.timer <= 0) {
      const door = state.level.doors.find((item) => item.id === op.action.doorId);
      if (door) door.state = "breached";
      op.action = null;
    }
    return;
  }

  if (op.id === state.selectedId && hasManualInput()) {
    updateManualOperator(op, dt);
    return;
  }

  const target = op.path[0];
  if (!target) return;

  const door = nearestClosedDoorOnRoute(op, target);
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

  if (!collidesWithMap(state.level, next)) {
    op.x = next.x;
    op.y = next.y;
  }
}

function updateManualOperator(op, dt) {
  let dx = 0;
  let dy = 0;
  if (keysDown.has("w")) dy -= 1;
  if (keysDown.has("s")) dy += 1;
  if (keysDown.has("a")) dx -= 1;
  if (keysDown.has("d")) dx += 1;
  if (dx === 0 && dy === 0) return;

  const length = Math.hypot(dx, dy);
  dx /= length;
  dy /= length;
  op.path = [];
  op.aim = Math.atan2(dy, dx);

  const next = {
    x: op.x + dx * op.speed * dt,
    y: op.y + dy * op.speed * dt,
    radius: op.radius
  };

  const door = nearestClosedDoorOnRoute(op, next);
  if (door && tryOpenDoor(op, door)) return;
  if (!collidesWithMap(state.level, next)) {
    op.x = next.x;
    op.y = next.y;
  }
}

function updateEnemy(enemy, dt) {
  if (enemy.down) return;

  const liveOps = state.level.operators.filter((op) => !op.down);
  const seen = liveOps.find((op) => inFieldOfView(enemy, op) && hasLineOfSight(enemy, op, state.level));
  if (seen) {
    enemy.targetId = seen.id;
    enemy.reaction += dt;
    enemy.angle = angleTo(enemy, seen);
    if (enemy.reaction > 0.7) {
      damageOperator(seen, 34);
      addShot(enemy, seen, colors.enemy);
      enemy.reaction = 0.1;
    }
    return;
  }

  enemy.targetId = null;
  enemy.reaction = Math.max(0, enemy.reaction - dt * 0.8);
  updateEnemyPatrol(enemy, dt);
}

function updateEnemyPatrol(enemy, dt) {
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
  if (!collidesWithMap(state.level, next)) {
    enemy.x = next.x;
    enemy.y = next.y;
  }
}

function updateOperatorCombat(op, dt) {
  if (op.down) return;
  const visible = state.level.enemies
    .filter((enemy) => !enemy.down)
    .filter((enemy) => pointDistance(op, enemy) < 210)
    .filter((enemy) => hasLineOfSight(op, enemy, state.level))
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
    addShot(op, target, op.color);
    op.reaction = 0.04;
  }
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

function addShot(from, to, color) {
  state.shots.push({
    from: { x: from.x, y: from.y },
    to: { x: to.x, y: to.y },
    color,
    ttl: 0.09
  });
}

function updateObjective() {
  const obj = state.level.objective;
  if (obj.secured || obj.harmed) return;

  // Clock-based VIP harm is disabled; enemies no longer fail the mission after a timer expires.
  // const enemyNear = state.level.enemies.some((enemy) => !enemy.down && pointDistance(enemy, obj) < 26);
  const opNear = state.level.operators.some((op) => !op.down && pointDistance(op, obj) < 34);
  // if (enemyNear && state.clock > 8) {
  //   obj.harmed = true;
  // }
  if (opNear) {
    obj.secured = true;
  }
}

function checkMissionEnd() {
  if (state.gameOver) return;
  const liveOps = state.level.operators.some((op) => !op.down);
  const allEnemiesDown = state.level.enemies.every((enemy) => enemy.down);
  if (state.level.objective.secured || allEnemiesDown) {
    finishMission("success", "Mission Complete", "Objective secured. The route held together.");
  } else if (!liveOps || state.level.objective.harmed) {
    finishMission("failure", "Mission Failed", "Restart and adjust the entry plan.");
  }
}

function finishMission(result, title, text) {
  state.gameOver = true;
  state.running = false;
  state.result = result;
  const nextIndex = (currentLevelIndex() + 1) % LEVEL_OPTIONS.length;
  const nextLevel = LEVEL_OPTIONS[nextIndex];
  bannerTitle.textContent = title;
  bannerText.textContent = `${text} Continue to ${nextLevel.title} or restart this level.`;
  nextLevelButton.textContent = nextIndex === 0 ? "First Level" : "Next Level";
  banner.classList.remove("hidden");
  updateHud();
}

function update(dt) {
  if (!state) return;
  const manualInput = hasManualInput();
  if (state.gameOver) return;
  // Clock progression is disabled.
  // state.clock += dt;

  for (const op of state.level.operators) {
    const isManualOperator = op.id === state.selectedId && manualInput;
    if (isManualOperator || state.running) {
      updateOperator(op, dt);
    }
  }
  for (const op of state.level.operators) updateOperatorCombat(op, dt);
  for (const enemy of state.level.enemies) updateEnemy(enemy, dt);

  updateObjective();
  state.shots = state.shots
    .map((shot) => ({ ...shot, ttl: shot.ttl - dt }))
    .filter((shot) => shot.ttl > 0);
  checkMissionEnd();
  updateHud();
}

function updateHud() {
  if (!state) {
    modeLabel.textContent = "Loading";
    clockLabel.textContent = "Off";
    objectiveLabel.textContent = "Loading";
    runButton.textContent = "Execute";
    return;
  }
  modeLabel.textContent = state.gameOver ? titleCase(state.result) : (hasManualInput() ? "Manual" : (state.running ? "Execute" : "Planning"));
  // Clock display is disabled.
  // clockLabel.textContent = state.clock.toFixed(1).padStart(4, "0");
  clockLabel.textContent = "Off";
  if (state.level.objective.secured) {
    objectiveLabel.textContent = "Secured";
  } else if (state.level.objective.harmed) {
    objectiveLabel.textContent = "Compromised";
  } else {
    const activeEnemies = state.level.enemies.filter((enemy) => !enemy.down).length;
    objectiveLabel.textContent = `${activeEnemies} hostiles`;
  }
  runButton.textContent = state.running ? "Pause" : "Execute";
}

function titleCase(value) {
  return value ? value[0].toUpperCase() + value.slice(1) : "";
}

function draw() {
  ctx.clearRect(0, 0, WORLD.w, WORLD.h);
  if (!state) {
    drawLoading();
    return;
  }
  drawFloor();
  drawRooms();
  drawPaths();
  drawSight();
  drawDoors();
  drawObjective();
  drawUnits();
  drawShots();
  drawHudOverlay();
  if (state.debug) drawDebug();
}

function drawLoading() {
  ctx.fillStyle = colors.floor;
  ctx.fillRect(0, 0, WORLD.w, WORLD.h);
  ctx.fillStyle = colors.text;
  ctx.font = "800 24px system-ui";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("Loading level...", WORLD.w / 2, WORLD.h / 2);
}

function drawFloor() {
  ctx.fillStyle = colors.floor;
  ctx.fillRect(0, 0, WORLD.w, WORLD.h);
  ctx.strokeStyle = colors.grid;
  ctx.lineWidth = 1;
  for (let x = 20; x < WORLD.w; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, 20);
    ctx.lineTo(x, WORLD.h - 20);
    ctx.stroke();
  }
  for (let y = 20; y < WORLD.h; y += 40) {
    ctx.beginPath();
    ctx.moveTo(20, y);
    ctx.lineTo(WORLD.w - 20, y);
    ctx.stroke();
  }

  ctx.fillStyle = colors.floorAlt;
  ctx.fillRect(140, 110, 155, 230);
  ctx.fillRect(315, 110, 185, 140);
  ctx.fillRect(520, 110, 270, 140);
  ctx.fillRect(315, 270, 185, 110);
  ctx.fillRect(520, 270, 130, 110);
  ctx.fillRect(670, 270, 120, 110);
  ctx.fillRect(140, 360, 155, 150);
  ctx.fillRect(315, 400, 185, 110);
  ctx.fillRect(520, 400, 270, 110);
}

function drawRooms() {
  for (const wall of state.level.walls) {
    ctx.fillStyle = colors.wall;
    ctx.fillRect(wall.x, wall.y, wall.w, wall.h);
    ctx.strokeStyle = colors.wallEdge;
    ctx.lineWidth = 2;
    ctx.strokeRect(wall.x, wall.y, wall.w, wall.h);
  }
}

function drawDoors() {
  for (const door of state.level.doors) {
    const center = rectCenter(door);
    ctx.save();
    ctx.translate(center.x, center.y);
    ctx.rotate(door.orientation === "vertical" ? Math.PI / 2 : 0);
    ctx.fillStyle = door.state === "closed" ? colors.doorClosed : colors.doorOpen;
    if (door.state === "closed") {
      ctx.fillRect(-doorLong(door) / 2, -4, doorLong(door), 8);
    } else {
      ctx.rotate(-0.72);
      ctx.fillRect(-doorLong(door) / 2, -4, doorLong(door), 8);
    }
    ctx.restore();
  }
}

function doorLong(door) {
  return Math.max(door.w, door.h);
}

function drawPaths() {
  for (const op of state.level.operators) {
    if (!op.path.length) continue;
    ctx.strokeStyle = op.id === state.selectedId ? colors.selected : op.color;
    ctx.lineWidth = op.id === state.selectedId ? 3 : 2;
    ctx.setLineDash([8, 8]);
    ctx.beginPath();
    ctx.moveTo(op.x, op.y);
    for (const point of op.path) ctx.lineTo(point.x, point.y);
    ctx.stroke();
    ctx.setLineDash([]);
    for (const point of op.path) {
      ctx.fillStyle = op.color;
      ctx.beginPath();
      ctx.arc(point.x, point.y, 4, 0, TWO_PI);
      ctx.fill();
    }
  }
}

function drawSight() {
  for (const enemy of state.level.enemies) {
    if (enemy.down) continue;
    drawCone(enemy, enemy.angle, enemy.sightRange, enemy.fov, colors.sight);
  }

  for (const op of state.level.operators) {
    if (op.down) continue;
    drawCone(op, op.aim, 120, Math.PI * 0.52, colors.opSight);
  }
}

function drawCone(origin, angle, length, fov, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.moveTo(origin.x, origin.y);
  ctx.arc(origin.x, origin.y, length, angle - fov / 2, angle + fov / 2);
  ctx.closePath();
  ctx.fill();
}

function drawObjective() {
  const obj = state.level.objective;
  ctx.fillStyle = obj.harmed ? colors.enemy : colors.hostage;
  ctx.strokeStyle = obj.secured ? colors.success : "#5d5330";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(obj.x, obj.y, obj.radius, 0, TWO_PI);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#171b1e";
  ctx.font = "700 11px system-ui";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("VIP", obj.x, obj.y + 1);
}

function drawUnits() {
  for (const enemy of state.level.enemies) drawUnit(enemy, enemy.down ? "#573030" : colors.enemy, enemy.id, false);
  for (const op of state.level.operators) drawUnit(op, op.down ? "#2d4035" : op.color, op.id, true);
}

function drawUnit(unit, fill, label, isOperator) {
  ctx.save();
  ctx.translate(unit.x, unit.y);
  ctx.rotate(isOperator ? unit.aim : unit.angle);
  ctx.fillStyle = fill;
  ctx.strokeStyle = unit.id === state.selectedId ? colors.selected : "#111";
  ctx.lineWidth = unit.id === state.selectedId ? 3 : 2;
  ctx.beginPath();
  ctx.arc(0, 0, unit.radius, 0, TWO_PI);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = isOperator ? colors.opDark : "#421d1d";
  ctx.beginPath();
  ctx.moveTo(unit.radius + 8, 0);
  ctx.lineTo(3, -5);
  ctx.lineTo(3, 5);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  ctx.fillStyle = colors.text;
  ctx.font = "800 10px system-ui";
  ctx.textAlign = "center";
  ctx.fillText(label, unit.x, unit.y - unit.radius - 8);

  const healthWidth = 30;
  ctx.fillStyle = "rgba(0,0,0,0.45)";
  ctx.fillRect(unit.x - healthWidth / 2, unit.y + unit.radius + 7, healthWidth, 4);
  ctx.fillStyle = isOperator ? colors.op : colors.enemy;
  ctx.fillRect(unit.x - healthWidth / 2, unit.y + unit.radius + 7, healthWidth * (unit.health / 100), 4);
}

function drawShots() {
  for (const shot of state.shots) {
    ctx.strokeStyle = shot.color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(shot.from.x, shot.from.y);
    ctx.lineTo(shot.to.x, shot.to.y);
    ctx.stroke();
  }
}

function drawHudOverlay() {
  const selected = selectedOperator();
  ctx.fillStyle = "rgba(16,18,20,0.78)";
  ctx.fillRect(22, 22, 278, 74);
  ctx.strokeStyle = "rgba(255,255,255,0.12)";
  ctx.strokeRect(22, 22, 278, 74);
  ctx.fillStyle = colors.text;
  ctx.font = "800 18px system-ui";
  ctx.textAlign = "left";
  ctx.fillText(hasManualInput() ? "Manual Control" : (state.running ? "Executing Plan" : "Planning Hold"), 38, 50);
  ctx.fillStyle = colors.muted;
  ctx.font = "600 13px system-ui";
  const pathCount = selected ? selected.path.length : 0;
  ctx.fillText(`Selected ${state.selectedId} | Waypoints ${pathCount}`, 38, 76);
}

function drawDebug() {
  ctx.save();
  ctx.strokeStyle = "rgba(255,255,255,0.28)";
  ctx.lineWidth = 1;
  for (const rect of blockingRects(state.level)) {
    ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
  }

  for (const enemy of state.level.enemies) {
    if (enemy.down) continue;
    ctx.strokeStyle = enemy.targetId ? colors.enemy : "rgba(226,95,95,0.45)";
    ctx.beginPath();
    ctx.arc(enemy.x, enemy.y, enemy.sightRange, 0, TWO_PI);
    ctx.stroke();
  }

  ctx.fillStyle = colors.text;
  ctx.font = "600 12px monospace";
  ctx.textAlign = "left";
  let y = 120;
  for (const op of state.level.operators) {
    ctx.fillText(`${op.id} hp:${op.health.toFixed(0)} action:${op.action ? op.action.type : "none"}`, 28, y);
    y += 18;
  }
  ctx.restore();
}

function onCanvasClick(event) {
  if (!state) return;
  if (state.gameOver) return;
  const pos = getMouseWorld(event);
  const clickedOp = state.level.operators.find((op) => !op.down && pointDistance(op, pos) <= op.radius + 8);
  if (clickedOp) {
    state.selectedId = clickedOp.id;
    updateHud();
    return;
  }

  const op = selectedOperator();
  if (!op || op.down) return;
  op.path.push({ x: pos.x, y: pos.y });
  if (op.path.length === 1) {
    op.aim = angleTo(op, op.path[0]);
  }
  updateHud();
}

function onCanvasContext(event) {
  event.preventDefault();
  if (!state) return;
  if (state.gameOver) return;
  const op = selectedOperator();
  if (!op) return;
  op.path = [];
  op.action = null;
  state.message = `${op.id} route cleared`;
  updateHud();
}

function handleKey(event) {
  if (!state) return;
  const key = event.key.toLowerCase();
  if (MANUAL_KEYS.has(key)) {
    event.preventDefault();
    keysDown.add(key);
    updateHud();
  } else if (event.code === "Space") {
    event.preventDefault();
    toggleRun();
  } else if (key === "r") {
    restart();
  } else if (event.key === "F3") {
    event.preventDefault();
    state.debug = !state.debug;
    debugButton.classList.toggle("active", state.debug);
  }
}

function handleKeyUp(event) {
  const key = event.key.toLowerCase();
  if (MANUAL_KEYS.has(key)) {
    event.preventDefault();
    keysDown.delete(key);
    updateHud();
  }
}

function loop(now) {
  const dt = Math.min(0.05, (now - lastTime) / 1000);
  lastTime = now;
  update(dt);
  draw();
  requestAnimationFrame(loop);
}

canvas.addEventListener("click", onCanvasClick);
canvas.addEventListener("contextmenu", onCanvasContext);
window.addEventListener("keydown", handleKey);
window.addEventListener("keyup", handleKeyUp);
window.addEventListener("blur", () => {
  keysDown.clear();
  updateHud();
});
runButton.addEventListener("click", toggleRun);
restartButton.addEventListener("click", restart);
bannerRestartButton.addEventListener("click", restart);
nextLevelButton.addEventListener("click", loadNextLevel);
debugButton.addEventListener("click", () => {
  if (!state) return;
  state.debug = !state.debug;
  debugButton.classList.toggle("active", state.debug);
});
levelSelect.addEventListener("change", () => {
  loadLevel(levelSelect.value);
});

window.__breachline = {
  getState: () => state,
  restart,
  loadLevel,
  loadNextLevel,
  toggleRun
};

populateLevelSelect();
loadLevel(LEVEL_OPTIONS[0].id);
requestAnimationFrame(loop);
