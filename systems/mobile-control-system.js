"use strict";

(function () {
  // Builds coarse-pointer mobile movement and shooting controls.
  function create(deps) {
    const runtime = deps.runtime;
    const elements = deps.elements;
    const moveActions = new Set(["moveUp", "moveDown", "moveLeft", "moveRight"]);
    const shootVectors = {
      up: { x: 0, y: -1 },
      down: { x: 0, y: 1 },
      left: { x: -1, y: 0 },
      right: { x: 1, y: 0 }
    };

    // Initializes mobile control listeners.
    function bindEvents() {
      if (!elements.mobileControls) return;
      updateLayoutMode();
      window.addEventListener("resize", updateLayoutMode);
      elements.mobileControls.addEventListener("pointerdown", handlePointerDown);
      elements.mobileControls.addEventListener("pointerup", handlePointerUp);
      elements.mobileControls.addEventListener("pointercancel", handlePointerUp);
      elements.mobileControls.addEventListener("pointerleave", handlePointerUp);
      if (elements.mobilePauseButton) elements.mobilePauseButton.addEventListener("click", deps.menu.openPause);
    }

    // Auto-expands on mobile or low-resolution layouts.
    function updateLayoutMode() {
      const mobile = window.matchMedia("(pointer: coarse)").matches || window.innerWidth <= 860;
      runtime.mobileMode = mobile;
      if (elements.mobileControls) elements.mobileControls.classList.toggle("hidden", !mobile);
      if (mobile) deps.menu.toggleExpanded(true);
    }

    // Starts movement or directional manual fire.
    function handlePointerDown(event) {
      const moveButton = event.target.closest("[data-mobile-action]");
      const shootButton = event.target.closest("[data-mobile-shoot]");
      if (moveButton) {
        event.preventDefault();
        deps.keysDown.add(moveButton.dataset.mobileAction);
        deps.updateHud();
      } else if (shootButton) {
        event.preventDefault();
        beginMobileShoot(shootButton.dataset.mobileShoot);
      }
    }

    // Stops movement or held mobile fire.
    function handlePointerUp(event) {
      const moveButton = event.target.closest("[data-mobile-action]");
      const shootButton = event.target.closest("[data-mobile-shoot]");
      if (moveButton) {
        event.preventDefault();
        deps.keysDown.delete(moveButton.dataset.mobileAction);
        deps.updateHud();
      } else if (shootButton) {
        event.preventDefault();
        runtime.manualFireHeld = false;
        runtime.manualFirePoint = null;
      } else {
        for (const action of moveActions) deps.keysDown.delete(action);
        runtime.manualFireHeld = false;
        runtime.manualFirePoint = null;
      }
    }

    // Begins held manual fire in a cardinal direction.
    function beginMobileShoot(direction) {
      const op = deps.selectedOperator();
      const vector = shootVectors[direction] || shootVectors.up;
      if (!op) return;
      if (runtime.state) runtime.state.shootingMode = "manual";
      runtime.manualFireHeld = true;
      runtime.manualFirePoint = {
        x: op.x + vector.x * 260,
        y: op.y + vector.y * 260
      };
      deps.shooting.manualFire(op, runtime.manualFirePoint);
      deps.updateHud();
    }

    return {
      bindEvents,
      updateLayoutMode
    };
  }

  window.MobileControlSystem = { create };
}());
