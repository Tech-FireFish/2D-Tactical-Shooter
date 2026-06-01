"use strict";

(function () {
  // Builds mouse, keyboard, and UI event bindings.
  function create(deps) {
    const runtime = deps.runtime;
    const elements = deps.elements;

    // Handles selecting operators, clicking doors, and adding waypoints.
    function onCanvasClick(event) {
      deps.audio.unlock();
      const state = runtime.state;
      if (!state) return;
      if (state.gameOver) return;
      const pos = deps.geometry.getMouseWorld(event);
      const clickedDoor = deps.geometry.doorAtPoint(pos);
      if (clickedDoor && deps.actions.openDoorByClick(clickedDoor)) return;

      const clickedOp = state.level.operators.find((op) => !op.down && deps.geometry.pointDistance(op, pos) <= op.radius + 8);
      if (clickedOp) {
        state.selectedId = clickedOp.id;
        deps.updateHud();
        return;
      }

      const op = deps.selectedOperator();
      if (!op || op.down) return;
      op.path.push({ x: pos.x, y: pos.y });
      if (op.path.length === 1) {
        op.aim = deps.geometry.angleTo(op, op.path[0]);
      }
      deps.updateHud();
    }

    // Clears the selected operator route on right-click.
    function onCanvasContext(event) {
      event.preventDefault();
      const state = runtime.state;
      if (!state) return;
      if (state.gameOver) return;
      const op = deps.selectedOperator();
      if (!op) return;
      op.path = [];
      op.action = null;
      state.message = `${op.id} route cleared`;
      deps.updateHud();
    }

    // Handles keyboard controls for overlays, movement, run state, doors, and debug.
    function handleKey(event) {
      deps.audio.unlock();
      const key = event.key.toLowerCase();
      if (event.key === "Escape") {
        event.preventDefault();
        if (deps.digitalLock.isOpen()) {
          deps.digitalLock.closeDigitalLock();
        } else {
          deps.settings.toggleSettings();
        }
        return;
      }
      const state = runtime.state;
      if (!state) return;
      if (deps.settings.gameplayPausedByOverlay()) return;
      if (deps.manualKeys.has(key)) {
        event.preventDefault();
        deps.keysDown.add(key);
        deps.updateHud();
      } else if (event.code === "Space") {
        event.preventDefault();
        deps.toggleRun();
      } else if (key === "r") {
        deps.level.restart();
      } else if (key === "e") {
        event.preventDefault();
        deps.actions.openNearestDoor();
      } else if (event.key === "F3") {
        event.preventDefault();
        state.debug = !state.debug;
        elements.debugButton.classList.toggle("active", state.debug);
      }
    }

    // Releases manual movement keys when gameplay is not overlay-paused.
    function handleKeyUp(event) {
      const key = event.key.toLowerCase();
      if (deps.settings.gameplayPausedByOverlay()) return;
      if (deps.manualKeys.has(key)) {
        event.preventDefault();
        deps.keysDown.delete(key);
        deps.updateHud();
      }
    }

    // Connects DOM events to the game systems once during boot.
    function bindEvents() {
      elements.canvas.addEventListener("click", onCanvasClick);
      elements.canvas.addEventListener("contextmenu", onCanvasContext);
      elements.operatorHealthBoard.addEventListener("click", (event) => {
        const card = event.target.closest("[data-operator-id]");
        if (!card) return;
        deps.selectOperator(card.dataset.operatorId);
      });
      elements.weaponSelect.addEventListener("change", () => {
        const op = deps.selectedOperator();
        if (!op) return;
        op.weaponId = deps.equipment.validWeaponId(elements.weaponSelect.value);
        op.fireTimer = 0;
        op.reaction = 0;
        deps.operatorLoadouts[op.id] = op.weaponId;
        runtime.state.message = `${op.id} equipped ${deps.equipment.weaponById(op.weaponId).name}`;
        deps.updateHud();
      });
      elements.armorSelect.addEventListener("change", () => {
        const op = deps.selectedOperator();
        if (!op) return;
        deps.equipment.applyOperatorArmor(op, elements.armorSelect.value);
      });
      window.addEventListener("keydown", handleKey);
      window.addEventListener("keyup", handleKeyUp);
      window.addEventListener("blur", () => {
        deps.keysDown.clear();
        deps.updateHud();
      });
      elements.runButton.addEventListener("click", deps.toggleRun);
      elements.restartButton.addEventListener("click", deps.level.restart);
      elements.bannerRestartButton.addEventListener("click", deps.level.restart);
      elements.nextLevelButton.addEventListener("click", deps.level.loadNextLevel);
      elements.settingsButton.addEventListener("click", deps.settings.openSettings);
      elements.closeSettingsButton.addEventListener("click", deps.settings.closeSettings);
      elements.settingsOverlay.addEventListener("click", (event) => {
        if (event.target === elements.settingsOverlay) deps.settings.closeSettings();
      });
      elements.debugButton.addEventListener("click", () => {
        const state = runtime.state;
        if (!state) return;
        if (deps.settings.gameplayPausedByOverlay()) return;
        state.debug = !state.debug;
        elements.debugButton.classList.toggle("active", state.debug);
      });
      elements.difficultySelect.addEventListener("change", () => {
        deps.setDifficulty(elements.difficultySelect.value);
      });
      elements.enemyLoadoutList.addEventListener("change", (event) => {
        const weaponSelectEl = event.target.closest("[data-enemy-weapon-id]");
        const armorSelectEl = event.target.closest("[data-enemy-armor-id]");
        if (weaponSelectEl) {
          deps.equipment.applyEnemyWeapon(weaponSelectEl.dataset.enemyWeaponId, weaponSelectEl.value);
        } else if (armorSelectEl) {
          deps.equipment.applyEnemyArmor(armorSelectEl.dataset.enemyArmorId, armorSelectEl.value);
        }
      });
      elements.unlockDigitalDoorButton.addEventListener("click", deps.digitalLock.submitDigitalLock);
      elements.cancelDigitalLockButton.addEventListener("click", () => deps.digitalLock.closeDigitalLock());
      elements.digitalLockOverlay.addEventListener("click", (event) => {
        if (event.target === elements.digitalLockOverlay) deps.digitalLock.closeDigitalLock();
      });
      elements.digitalLockKeypad.addEventListener("click", (event) => {
        const digitButton = event.target.closest("[data-lock-digit]");
        const actionButton = event.target.closest("[data-lock-action]");
        if (digitButton) {
          deps.digitalLock.appendDigit(digitButton.dataset.lockDigit);
        } else if (actionButton && actionButton.dataset.lockAction === "clear") {
          deps.digitalLock.clearCode();
        } else if (actionButton && actionButton.dataset.lockAction === "delete") {
          deps.digitalLock.deleteDigit();
        }
      });
      elements.levelSelect.addEventListener("change", () => {
        deps.settings.setResumeRunning(false);
        deps.level.loadLevel(elements.levelSelect.value);
      });
      elements.operatorCountSelect.addEventListener("change", () => {
        deps.settings.setResumeRunning(false);
        runtime.activeOperatorCount = Number(elements.operatorCountSelect.value);
        deps.level.restart();
      });
    }

    return {
      bindEvents
    };
  }

  window.InputSystem = { create };
}());
