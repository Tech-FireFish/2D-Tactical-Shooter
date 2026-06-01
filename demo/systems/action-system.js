"use strict";

(function () {
  // Builds the movement, door, and combat API around shared game dependencies.
  function create(deps) {
    // Reads the live runtime state through the dependency boundary.
    function getState() {
      return deps.getState();
    }

    // Handles the actual door effect for locked and unlocked doors.
    function interactWithDoor(op, door) {
      const state = getState();
      if (!state || !door || !op || op.down) return false;
      if (deps.isLockedDigitalDoor(door)) {
        deps.audio.play("door-locked");
        deps.enemyBehavior.noticeDoor(door, op);
        deps.openDigitalLock(door);
        state.message = `${door.id} locked`;
        deps.updateHud();
        return true;
      }
      door.state = "open";
      op.action = null;
      deps.audio.play("door-open");
      deps.enemyBehavior.noticeDoor(door, op);
      state.message = `${op.id} opened ${door.id}`;
      deps.updateHud();
      return true;
    }

    // Attempts to interact with the nearest closed door to the selected operator.
    function openNearestDoor() {
      deps.interaction.interactNearest();
    }

    // Attempts door interaction from a mouse click, including range checks.
    function openDoorByClick(door) {
      const state = getState();
      if (!state) return false;
      const op = deps.selectedOperator();
      if (!op || op.down) return false;
      if (deps.pointRectDistance(op, door) > 52) {
        state.message = "Move closer to the door";
        deps.updateHud();
        return true;
      }
      return interactWithDoor(op, door);
    }

    // Moves an operator along manual input or planned pathing.
    function updateOperator(op, dt) {
      const state = getState();
      if (!state || op.down) return;
      if (op.action) {
        op.action.timer -= dt;
        if (op.action.timer <= 0) {
          const door = state.level.doors.find((item) => item.id === op.action.doorId);
          if (door) door.state = "breached";
          op.action = null;
        }
        return;
      }

      if (op.id === state.selectedId && deps.hasManualInput()) {
        updateManualOperator(op, dt);
        return;
      }

      const target = op.path[0];
      if (!target) return;

      const dist = deps.pointDistance(op, target);
      if (dist < 4) {
        op.path.shift();
        return;
      }

      const direction = deps.angleTo(op, target);
      op.aim = direction;
      const step = Math.min(dist, op.speed * dt);
      const next = {
        x: op.x + Math.cos(direction) * step,
        y: op.y + Math.sin(direction) * step,
        radius: op.radius
      };

      if (!deps.collidesWithMap(state.level, next)) {
        op.x = next.x;
        op.y = next.y;
        op.movedBefore = true;
        deps.audio.noteLoopActivity("operator-walk");
      }
    }

    // Applies WASD movement to the selected operator.
    function updateManualOperator(op, dt) {
      const state = getState();
      if (!state) return;
      let dx = 0;
      let dy = 0;
      if (deps.isActionDown("moveUp")) dy -= 1;
      if (deps.isActionDown("moveDown")) dy += 1;
      if (deps.isActionDown("moveLeft")) dx -= 1;
      if (deps.isActionDown("moveRight")) dx += 1;
      if (dx === 0 && dy === 0) return;

      const length = Math.hypot(dx, dy);
      dx /= length;
      dy /= length;
      op.path = [];
      op.aim = Math.atan2(dy, dx);

      const speedMultiplier = deps.isActionDown("sprint") ? 1.55 : (deps.isActionDown("sneak") ? 0.48 : 1);
      const next = {
        x: op.x + dx * op.speed * speedMultiplier * dt,
        y: op.y + dy * op.speed * speedMultiplier * dt,
        radius: op.radius
      };

      if (!deps.collidesWithMap(state.level, next)) {
        op.x = next.x;
        op.y = next.y;
        op.movedBefore = true;
        deps.audio.noteLoopActivity("operator-walk");
      }
    }

    // Updates enemy targeting, watch direction, patrol, and firing.
    function updateEnemy(enemy, dt) {
      deps.shooting.updateReload(enemy, dt);
      deps.enemyBehavior.updateEnemy(enemy, dt, {
        fireAtOperator: (shooter, target, weapon, frameDt) => {
          fireAutomatic(shooter, target, weapon, frameDt, damageOperator, deps.colors.enemy);
        }
      });
    }

    // Moves an enemy through its patrol route when no target is visible.
    function updateEnemyPatrol(enemy, dt) {
      deps.enemyBehavior.updateEnemyPatrol(enemy, dt);
    }

    // Finds visible hostile targets and fires the operator weapon automatically.
    function updateOperatorCombat(op, dt) {
      const state = getState();
      if (!state || op.down) return;
      deps.shooting.updateReload(op, dt);
      op.fireTimer = Math.max(0, (op.fireTimer || 0) - dt);
      if (state.shootingMode === "manual") return;
      const weapon = deps.weaponById(op.weaponId);
      const visible = state.level.enemies
        .filter((enemy) => !enemy.down)
        .filter((enemy) => deps.pointDistance(op, enemy) <= Math.min(weapon.range, deps.operatorSightRange(op)))
        .filter((enemy) => deps.hasLineOfSight(op, enemy, state.level))
        .sort((a, b) => deps.pointDistance(op, a) - deps.pointDistance(op, b));

      const target = visible[0];
      if (!target) {
        op.targetId = null;
        op.reaction = Math.max(0, op.reaction - dt * 0.9);
        op.fireTimer = Math.max(0, op.fireTimer - dt);
        return;
      }

      op.aim = deps.angleTo(op, target);
      fireAutomatic(op, target, weapon, dt, damageEnemy, op.color);
    }

    // Runs reaction timing, fire rate timing, damage, and tracer creation.
    function fireAutomatic(shooter, target, weapon, dt, damageTarget, color) {
      if (shooter.targetId !== target.id) {
        shooter.targetId = target.id;
        shooter.reaction = 0;
        shooter.fireTimer = 0;
      }

      shooter.reaction += dt;
      deps.shooting.updateReload(shooter, dt);
      shooter.fireTimer = Math.max(0, shooter.fireTimer - dt);
      if (shooter.reaction < weapon.reactionDelay || shooter.fireTimer > 0) {
        return;
      }

      if (!deps.shooting.consumeRound(shooter, weapon)) return;
      damageTarget(target, weapon.damage, shooter);
      deps.shooting.addShot(shooter, target, color, weapon.tracerTtl);
      deps.audio.playWeapon(weapon.id || shooter.weaponId);
      deps.enemyBehavior.noticeShot(shooter, target);
      shooter.fireTimer = weapon.fireInterval;
    }

    // Applies damage to an enemy and marks it down at zero health.
    function damageEnemy(enemy, amount, source) {
      const wasDown = enemy.down;
      applyDamage(enemy, amount);
      deps.enemyBehavior.noticeDamage(enemy, source);
      if (enemy.health <= 0) {
        enemy.health = 0;
        enemy.down = true;
        enemy.status = "down";
        enemy.targetId = null;
        enemy.fireTimer = 0;
        if (!wasDown) {
          deps.enemyBehavior.noticeEnemyDown(enemy, source);
        }
      }
    }

    // Applies damage to an operator and clears active behavior when downed.
    function damageOperator(op, amount) {
      const wasDown = op.down;
      applyDamage(op, amount);
      if (op.health <= 0) {
        op.health = 0;
        op.down = true;
        op.path = [];
        op.action = null;
        op.fireTimer = 0;
        if (!wasDown) {
          deps.audio.play("operator-down");
        }
      }
    }

    // Spends armor before allowing remaining damage to reduce health.
    function applyDamage(unit, amount) {
      let remaining = amount;
      if (unit.armor > 0) {
        const absorbed = Math.min(unit.armor, remaining);
        unit.armor -= absorbed;
        remaining -= absorbed;
      }
      if (remaining > 0) {
        unit.health -= remaining;
      }
    }

    return {
      openNearestDoor,
      openDoorByClick,
      updateOperator,
      updateManualOperator,
      updateEnemy,
      updateEnemyPatrol,
      updateOperatorCombat,
      damageEnemy,
      damageOperator,
      applyDamage
    };
  }

  window.ActionSystem = { create };
}());
