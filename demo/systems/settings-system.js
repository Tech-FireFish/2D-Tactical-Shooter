"use strict";

(function () {
  // Builds settings overlay controls and shared overlay pause behavior.
  function create(deps) {
    const runtime = deps.runtime;
    const elements = deps.elements;

    // Opens settings, pauses execution, and remembers whether to resume.
    function openSettings() {
      if (runtime.settingsOpen || runtime.digitalLockOpen || runtime.inventoryOpen || runtime.equipmentTableOpen) return;
      runtime.settingsResumeRunning = Boolean(runtime.state && runtime.state.running);
      if (runtime.state) runtime.state.running = false;
      deps.keysDown.clear();
      runtime.settingsOpen = true;
      elements.settingsOverlay.classList.remove("hidden");
      setActiveTab(runtime.activeSettingsTab || "keys");
      deps.renderEnemyLoadouts();
      deps.updateHud();
    }

    // Closes settings and restores execution when it was previously running.
    function closeSettings() {
      if (!runtime.settingsOpen) return;
      runtime.settingsOpen = false;
      elements.settingsOverlay.classList.add("hidden");
      if (runtime.state && !runtime.state.gameOver && runtime.settingsResumeRunning) {
        runtime.state.running = true;
      }
      runtime.settingsResumeRunning = false;
      deps.updateHud();
    }

    // Switches the settings overlay between open and closed.
    function toggleSettings() {
      if (runtime.settingsOpen) {
        closeSettings();
      } else {
        openSettings();
      }
    }

    // Reports whether any modal overlay should freeze gameplay updates.
    function gameplayPausedByOverlay() {
      return runtime.settingsOpen || runtime.digitalLockOpen || runtime.inventoryOpen || runtime.equipmentTableOpen || runtime.laptopOpen;
    }

    // Overrides the stored resume state for setup changes.
    function setResumeRunning(value) {
      runtime.settingsResumeRunning = value;
    }

    // Reports whether the settings overlay is currently open.
    function isOpen() {
      return runtime.settingsOpen;
    }

    // Shows one settings section and hides the other tab panels.
    function setActiveTab(tabId) {
      runtime.activeSettingsTab = tabId || "keys";
      for (const tab of elements.settingsTabs || []) {
        tab.classList.toggle("active", tab.dataset.settingsTab === runtime.activeSettingsTab);
      }
      for (const panel of elements.settingsPanels || []) {
        panel.classList.toggle("hidden", panel.dataset.settingsPanel !== runtime.activeSettingsTab);
      }
    }

    return {
      openSettings,
      closeSettings,
      toggleSettings,
      gameplayPausedByOverlay,
      setResumeRunning,
      setActiveTab,
      isOpen
    };
  }

  window.SettingsSystem = { create };
}());
