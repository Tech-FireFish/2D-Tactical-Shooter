"use strict";

(function () {
  // Builds all canvas drawing routines for the tactical view.
  function create(deps) {
    const runtime = deps.runtime;
    const ctx = deps.ctx;
    const world = deps.world;
    const colors = deps.colors;
    const twoPi = deps.twoPi;

    // Draws one full frame of the current game state.
    function draw() {
      ctx.clearRect(0, 0, world.w, world.h);
      if (!runtime.state) {
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
      if (runtime.state.debug) drawDebug();
    }

    // Draws the loading screen when no level state is available.
    function drawLoading() {
      ctx.fillStyle = colors.floor;
      ctx.fillRect(0, 0, world.w, world.h);
      ctx.fillStyle = colors.text;
      ctx.font = "800 24px system-ui";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("Loading level...", world.w / 2, world.h / 2);
    }

    // Draws the map floor, grid, and floor zone fills.
    function drawFloor() {
      const state = runtime.state;
      ctx.fillStyle = colors.floor;
      ctx.fillRect(0, 0, world.w, world.h);
      ctx.strokeStyle = colors.grid;
      ctx.lineWidth = 1;
      for (let x = 20; x < world.w; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 20);
        ctx.lineTo(x, world.h - 20);
        ctx.stroke();
      }
      for (let y = 20; y < world.h; y += 40) {
        ctx.beginPath();
        ctx.moveTo(20, y);
        ctx.lineTo(world.w - 20, y);
        ctx.stroke();
      }

      ctx.fillStyle = colors.floorAlt;
      const zones = state.level.floorZones.length ? state.level.floorZones : [
        { x: 140, y: 110, w: 155, h: 230 },
        { x: 315, y: 110, w: 185, h: 140 },
        { x: 520, y: 110, w: 270, h: 140 },
        { x: 315, y: 270, w: 185, h: 110 },
        { x: 520, y: 270, w: 130, h: 110 },
        { x: 670, y: 270, w: 120, h: 110 },
        { x: 140, y: 360, w: 155, h: 150 },
        { x: 315, y: 400, w: 185, h: 110 },
        { x: 520, y: 400, w: 270, h: 110 }
      ];
      for (const zone of zones) {
        ctx.fillRect(zone.x, zone.y, zone.w, zone.h);
      }
    }

    // Draws wall rectangles and their outlines.
    function drawRooms() {
      for (const wall of runtime.state.level.walls) {
        ctx.fillStyle = colors.wall;
        ctx.fillRect(wall.x, wall.y, wall.w, wall.h);
        ctx.strokeStyle = colors.wallEdge;
        ctx.lineWidth = 2;
        ctx.strokeRect(wall.x, wall.y, wall.w, wall.h);
      }
    }

    // Draws each door in closed or open orientation.
    function drawDoors() {
      for (const door of runtime.state.level.doors) {
        const center = deps.geometry.rectCenter(door);
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
        drawDoorIndicator(door, center);
      }
    }

    // Draws lock/unlock markers for digital doors.
    function drawDoorIndicator(door, center) {
      if (!deps.geometry.isDigitalLockDoor(door) || door.state !== "closed") return;
      const locked = deps.geometry.isLockedDigitalDoor(door);
      ctx.save();
      ctx.fillStyle = locked ? colors.doorLocked : colors.doorUnlocked;
      ctx.strokeStyle = "rgba(0,0,0,0.65)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(center.x, center.y, 9, 0, twoPi);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#101214";
      ctx.font = "900 10px system-ui";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(locked ? "L" : "U", center.x, center.y + 0.5);
      ctx.restore();
    }

    // Returns the long side of a door rectangle for door drawing.
    function doorLong(door) {
      return Math.max(door.w, door.h);
    }

    // Draws operator waypoint routes and waypoint dots.
    function drawPaths() {
      const state = runtime.state;
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
          ctx.arc(point.x, point.y, 4, 0, twoPi);
          ctx.fill();
        }
      }
    }

    // Draws enemy and operator vision cones with difficulty visibility rules.
    function drawSight() {
      const state = runtime.state;
      for (const enemy of state.level.enemies) {
        if (enemy.down) continue;
        if (runtime.currentDifficulty === "difficult" && !deps.visibility.visibleToOperators(enemy)) continue;
        drawCone(enemy, enemy.angle, enemy.sightRange, enemy.fov, colors.sight);
      }

      for (const op of state.level.operators) {
        if (op.down) continue;
        drawCone(op, op.aim, deps.visibility.operatorSightRange(op), Math.PI * 0.52, colors.opSight);
      }
    }

    // Draws a filled radial vision cone.
    function drawCone(origin, angle, length, fov, fill) {
      ctx.fillStyle = fill;
      ctx.beginPath();
      ctx.moveTo(origin.x, origin.y);
      ctx.arc(origin.x, origin.y, length, angle - fov / 2, angle + fov / 2);
      ctx.closePath();
      ctx.fill();
    }

    // Draws the VIP objective when it is visible.
    function drawObjective() {
      if (!deps.visibility.objectiveVisible()) return;
      const obj = runtime.state.level.objective;
      ctx.fillStyle = obj.harmed ? colors.enemy : colors.hostage;
      ctx.strokeStyle = obj.secured ? colors.success : "#5d5330";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(obj.x, obj.y, obj.radius, 0, twoPi);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#171b1e";
      ctx.font = "700 11px system-ui";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("VIP", obj.x, obj.y + 1);
    }

    // Draws all visible enemies and all operators.
    function drawUnits() {
      const state = runtime.state;
      for (const enemy of state.level.enemies) {
        if (runtime.currentDifficulty === "difficult" && !deps.visibility.visibleToOperators(enemy)) continue;
        drawUnit(enemy, enemy.down ? "#573030" : colors.enemy, enemy.id, false);
      }
      for (const op of state.level.operators) drawUnit(op, op.down ? "#2d4035" : op.color, op.id, true);
    }

    // Draws one unit body, facing marker, and label.
    function drawUnit(unit, fill, label, isOperator) {
      ctx.save();
      ctx.translate(unit.x, unit.y);
      ctx.rotate(isOperator ? unit.aim : unit.angle);
      ctx.fillStyle = fill;
      ctx.strokeStyle = unit.id === runtime.state.selectedId ? colors.selected : "#111";
      ctx.lineWidth = unit.id === runtime.state.selectedId ? 3 : 2;
      ctx.beginPath();
      ctx.arc(0, 0, unit.radius, 0, twoPi);
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
    }

    // Draws active bullet tracers.
    function drawShots() {
      for (const shot of runtime.state.shots) {
        ctx.strokeStyle = shot.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(shot.from.x, shot.from.y);
        ctx.lineTo(shot.to.x, shot.to.y);
        ctx.stroke();
      }
    }

    // Draws the in-canvas selected-operator status and door hint.
    function drawHudOverlay() {
      const state = runtime.state;
      const selected = deps.selectedOperator();
      const nearDoor = selected && !selected.down ? deps.geometry.nearestClosedDoorToOperator(selected) : null;
      ctx.fillStyle = "rgba(16,18,20,0.78)";
      ctx.fillRect(22, 22, 304, nearDoor ? 96 : 74);
      ctx.strokeStyle = "rgba(255,255,255,0.12)";
      ctx.strokeRect(22, 22, 304, nearDoor ? 96 : 74);
      ctx.fillStyle = colors.text;
      ctx.font = "800 18px system-ui";
      ctx.textAlign = "left";
      ctx.fillText(deps.hasManualInput() ? "Manual Control" : (state.running ? "Executing Plan" : "Planning Hold"), 38, 50);
      ctx.fillStyle = colors.muted;
      ctx.font = "600 13px system-ui";
      const pathCount = selected ? selected.path.length : 0;
      ctx.fillText(`Selected ${state.selectedId} | Waypoints ${pathCount}`, 38, 76);
      if (nearDoor) {
        ctx.fillStyle = colors.doorClosed;
        ctx.font = "800 12px system-ui";
        const hint = deps.geometry.isLockedDigitalDoor(nearDoor)
          ? "Door locked: press E or click to enter code"
          : (deps.geometry.isDigitalLockDoor(nearDoor) ? "Door unlocked: press E or click to open" : "Door nearby: press E or click the door");
        ctx.fillText(hint, 38, 98);
      }
    }

    // Draws debug collision outlines, sight ranges, and operator state text.
    function drawDebug() {
      const state = runtime.state;
      ctx.save();
      ctx.strokeStyle = "rgba(255,255,255,0.28)";
      ctx.lineWidth = 1;
      for (const rect of deps.geometry.blockingRects(state.level)) {
        ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
      }

      for (const enemy of state.level.enemies) {
        if (enemy.down) continue;
        ctx.strokeStyle = enemy.targetId ? colors.enemy : "rgba(226,95,95,0.45)";
        ctx.beginPath();
        ctx.arc(enemy.x, enemy.y, enemy.sightRange, 0, twoPi);
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

    return {
      draw
    };
  }

  window.RenderSystem = { create };
}());
