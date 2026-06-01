"use strict";

(function () {
  // Builds status-driven enemy awareness, search, and attack behavior.
  function create(deps) {
    const calmStatus = "calm";
    const suspiciousStatus = "suspicious";
    const alertStatus = "alert";
    const downStatus = "down";

    // Updates one enemy through calm, suspicious, alert, or down behavior.
    function updateEnemy(enemy, dt, combat) {
      const state = deps.getState();
      if (!state) return;
      if (enemy.down) {
        enemy.status = downStatus;
        return;
      }

      const weapon = deps.weaponById(enemy.weaponId);
      const seen = findVisibleOperator(enemy, weapon);
      if (seen) {
        setStatus(enemy, alertStatus, seen);
        enemy.angle = deps.angleTo(enemy, seen);
        combat.fireAtOperator(enemy, seen, weapon, dt);
        return;
      }

      enemy.targetId = null;
      enemy.reaction = Math.max(0, enemy.reaction - dt * 0.8);
      enemy.fireTimer = Math.max(0, enemy.fireTimer - dt);
      if (enemy.status === alertStatus) {
        setStatus(enemy, suspiciousStatus, enemy.lastKnownOperator);
      }
      if (enemy.status === suspiciousStatus) {
        updateSuspiciousEnemy(enemy, dt);
        return;
      }
      updateCalmEnemy(enemy, dt);
    }

    // Finds the first living operator visible to an enemy with the current weapon.
    function findVisibleOperator(enemy, weapon) {
      const state = deps.getState();
      const liveOps = state.level.operators.filter((op) => !op.down);
      return liveOps
        .filter((op) => deps.pointDistance(enemy, op) <= weapon.range)
        .find((op) => deps.inFieldOfView(enemy, op) && deps.hasLineOfSight(enemy, op, state.level));
    }

    // Applies a status and stores search information when a target point exists.
    function setStatus(enemy, status, target) {
      enemy.status = status;
      if (status === alertStatus || status === suspiciousStatus) {
        const point = target ? { x: target.x, y: target.y } : enemy.lastKnownOperator;
        enemy.lastKnownOperator = point ? { ...point } : null;
        enemy.searchTarget = point ? { ...point } : enemy.searchTarget;
        enemy.suspicionTimer = status === alertStatus ? 4.5 : Math.max(enemy.suspicionTimer || 0, 5.5);
      }
    }

    // Moves or aims a suspicious enemy toward its last known contact point.
    function updateSuspiciousEnemy(enemy, dt) {
      enemy.suspicionTimer = Math.max(0, (enemy.suspicionTimer || 0) - dt);
      const target = enemy.searchTarget || enemy.lastKnownOperator;
      if (target) {
        enemy.angle = deps.angleTo(enemy, target);
        moveEnemyToward(enemy, target, dt, 0.72);
        if (deps.pointDistance(enemy, target) < 14) {
          enemy.searchTarget = null;
        }
      } else if (enemy.watch) {
        enemy.angle = deps.angleTo(enemy, enemy.watch);
      }
      if (enemy.suspicionTimer <= 0) {
        enemy.status = calmStatus;
        enemy.lastKnownOperator = null;
        enemy.searchTarget = null;
      }
    }

    // Keeps calm enemies watching assigned points or following their patrol.
    function updateCalmEnemy(enemy, dt) {
      enemy.status = calmStatus;
      if (enemy.watch) {
        enemy.angle = deps.angleTo(enemy, enemy.watch);
        return;
      }
      updateEnemyPatrol(enemy, dt);
    }

    // Moves an enemy through its patrol route while calm.
    function updateEnemyPatrol(enemy, dt) {
      if (!enemy.patrol || enemy.patrol.length < 2) return;
      const target = enemy.patrol[enemy.patrolIndex];
      const dist = deps.pointDistance(enemy, target);
      if (dist < 5) {
        enemy.patrolIndex = (enemy.patrolIndex + 1) % enemy.patrol.length;
        return;
      }
      enemy.angle = deps.angleTo(enemy, target);
      moveEnemyToward(enemy, target, dt, 1);
    }

    // Moves one enemy toward a target point if the next step does not collide.
    function moveEnemyToward(enemy, target, dt, speedMultiplier) {
      const state = deps.getState();
      const direction = deps.angleTo(enemy, target);
      const next = {
        x: enemy.x + Math.cos(direction) * enemy.speed * speedMultiplier * dt,
        y: enemy.y + Math.sin(direction) * enemy.speed * speedMultiplier * dt,
        radius: enemy.radius
      };
      if (!deps.collidesWithMap(state.level, next)) {
        enemy.x = next.x;
        enemy.y = next.y;
        deps.audio.noteLoopActivity("enemy-walk");
      }
    }

    // Alerts enemies near a newly opened or locked door interaction.
    function noticeDoor(door, op) {
      const point = op || deps.rectCenter(door);
      notifyNearby(point, 320, (enemy, distance) => {
        if (distance < 180 && deps.hasLineOfSight(enemy, point, deps.getState().level)) {
          setStatus(enemy, alertStatus, point);
        } else {
          setStatus(enemy, suspiciousStatus, point);
        }
      });
    }

    // Alerts enemies that can hear or see a recent gunshot.
    function noticeShot(shooter, target) {
      const point = shooter || target;
      notifyNearby(point, 420, (enemy, distance) => {
        if (distance < 220 && deps.hasLineOfSight(enemy, point, deps.getState().level)) {
          setStatus(enemy, alertStatus, point);
        } else {
          setStatus(enemy, suspiciousStatus, point);
        }
      });
    }

    // Pushes a damaged enemy into alert behavior toward the shooter if known.
    function noticeDamage(unit, source) {
      if (!unit || !source || unit.down) return;
      if (unit.kind === "operator") return;
      setStatus(unit, alertStatus, source);
    }

    // Alerts nearby enemies when another enemy goes down.
    function noticeEnemyDown(enemy, source) {
      const point = enemy || source;
      notifyNearby(point, 360, (other) => {
        if (other.id === enemy.id) return;
        setStatus(other, suspiciousStatus, source || point);
      });
    }

    // Iterates living enemies around a point and applies a callback.
    function notifyNearby(point, radius, callback) {
      const state = deps.getState();
      if (!state || !point) return;
      for (const enemy of state.level.enemies) {
        if (enemy.down) continue;
        const distance = deps.pointDistance(enemy, point);
        if (distance <= radius) {
          callback(enemy, distance);
        }
      }
    }

    return {
      updateEnemy,
      findVisibleOperator,
      setStatus,
      updateSuspiciousEnemy,
      updateCalmEnemy,
      updateEnemyPatrol,
      moveEnemyToward,
      noticeDoor,
      noticeShot,
      noticeDamage,
      noticeEnemyDown
    };
  }

  window.EnemyBehaviorSystem = { create };
}());
