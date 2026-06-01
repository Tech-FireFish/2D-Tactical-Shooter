"use strict";

(function () {
  // Builds digital lock overlay controls and password submission behavior.
  function create(deps) {
    const runtime = deps.runtime;
    const elements = deps.elements;

    // Opens the password overlay for a locked digital door.
    function openDigitalLock(door) {
      if (!runtime.state || !door || runtime.digitalLockOpen || runtime.settingsOpen) return;
      runtime.digitalLockResumeRunning = Boolean(runtime.state.running);
      runtime.state.running = false;
      deps.keysDown.clear();
      runtime.activeDigitalDoorId = door.id;
      elements.digitalLockTitle.textContent = `${door.id} Locked`;
      elements.digitalLockInput.value = "";
      elements.digitalLockError.textContent = "";
      runtime.digitalLockOpen = true;
      elements.digitalLockOverlay.classList.remove("hidden");
      elements.digitalLockInput.focus();
      deps.updateHud();
    }

    // Closes the password overlay and optionally resumes execution.
    function closeDigitalLock(restoreRunning = true) {
      if (!runtime.digitalLockOpen) return;
      runtime.digitalLockOpen = false;
      elements.digitalLockOverlay.classList.add("hidden");
      runtime.activeDigitalDoorId = null;
      if (restoreRunning && runtime.state && !runtime.state.gameOver && runtime.digitalLockResumeRunning) {
        runtime.state.running = true;
      }
      runtime.digitalLockResumeRunning = false;
      deps.updateHud();
    }

    // Validates the entered password and unlocks the active door on success.
    function submitDigitalLock() {
      if (!runtime.state || !runtime.activeDigitalDoorId) return;
      const door = runtime.state.level.doors.find((item) => item.id === runtime.activeDigitalDoorId);
      if (!door) {
        closeDigitalLock(false);
        return;
      }
      if (elements.digitalLockInput.value === (door.password || "0000")) {
        door.locked = false;
        door.state = "closed";
        runtime.state.message = `${door.id} unlocked`;
        closeDigitalLock();
      } else {
        elements.digitalLockError.textContent = "Incorrect password";
        elements.digitalLockInput.select();
      }
    }

    // Reports whether the digital lock overlay is currently open.
    function isOpen() {
      return runtime.digitalLockOpen;
    }

    return {
      openDigitalLock,
      closeDigitalLock,
      submitDigitalLock,
      isOpen
    };
  }

  window.DigitalLockSystem = { create };
}());
