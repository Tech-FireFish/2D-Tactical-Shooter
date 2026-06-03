"use strict";

(function () {
  // Builds start, main, pause, expanded, and overlay navigation behavior.
  function create(deps) {
    const runtime = deps.runtime;
    const elements = deps.elements;

    // Shows the start screen at boot.
    function showStart() {
      if (elements.startMenuOverlay) elements.startMenuOverlay.classList.remove("hidden");
      if (elements.mainMenuOverlay) elements.mainMenuOverlay.classList.add("hidden");
      closePause();
      if (runtime.state) runtime.state.running = false;
    }

    // Shows the main navigation page.
    function showMain() {
      if (elements.startMenuOverlay) elements.startMenuOverlay.classList.add("hidden");
      if (elements.mainMenuOverlay) elements.mainMenuOverlay.classList.remove("hidden");
      closePause();
      if (runtime.state) runtime.state.running = false;
      render();
    }

    // Enters active gameplay from menus.
    function enterGame() {
      if (elements.startMenuOverlay) elements.startMenuOverlay.classList.add("hidden");
      if (elements.mainMenuOverlay) elements.mainMenuOverlay.classList.add("hidden");
      closePause();
      deps.updateHud();
    }

    // Opens pause navigation and freezes gameplay.
    function openPause() {
      if (runtime.pauseOpen) return;
      runtime.pauseResumeRunning = Boolean(runtime.state && runtime.state.running);
      if (runtime.state) runtime.state.running = false;
      runtime.pauseOpen = true;
      deps.keysDown.clear();
      elements.pauseOverlay.classList.remove("hidden");
      deps.updateHud();
    }

    // Closes pause navigation and optionally resumes gameplay.
    function closePause() {
      if (!runtime.pauseOpen) return;
      runtime.pauseOpen = false;
      elements.pauseOverlay.classList.add("hidden");
      if (runtime.state && !runtime.state.gameOver && runtime.pauseResumeRunning) runtime.state.running = true;
      runtime.pauseResumeRunning = false;
      deps.updateHud();
    }

    // Opens main page focused on levels.
    function showLevelMenu() {
      closePause();
      showMain();
    }

    // Opens main page focused on tutorials.
    function showTutorialMenu() {
      closePause();
      showMain();
    }

    // Opens Settings from pause.
    function openSettingsFromPause() {
      closePause();
      deps.settings.openSettings();
    }

    // Toggles expanded gameplay layout.
    function toggleExpanded(force) {
      const next = typeof force === "boolean" ? force : !runtime.expandedGame;
      runtime.expandedGame = next;
      document.body.classList.toggle("game-expanded", next);
      if (elements.expandedNav) elements.expandedNav.classList.toggle("hidden", !next);
      if (elements.expandGameButton) elements.expandGameButton.textContent = next ? "Collapse" : "Expand";
      deps.updateHud();
    }

    // Renders level/tutorial number blocks and privilege state.
    function render() {
      deps.progression.renderPrivilegeBoard();
      renderLevelBlocks();
      renderTutorialBlocks();
      if (elements.menuDifficultySelect) elements.menuDifficultySelect.value = runtime.currentDifficulty;
      if (elements.menuShootingModeSelect && runtime.state) elements.menuShootingModeSelect.value = runtime.state.shootingMode || "automatic";
    }

    // Renders story level number blocks.
    function renderLevelBlocks() {
      if (!elements.menuLevelBlocks) return;
      elements.menuLevelBlocks.innerHTML = deps.levelOptions.map((level, index) => {
        const unlocked = deps.progression.isLevelUnlocked(index);
        return `<button type="button" data-menu-level="${level.id}" class="${unlocked ? "" : "locked"}" ${unlocked ? "" : "disabled"} title="${level.title}">${index + 1}</button>`;
      }).join("");
    }

    // Renders tutorial number blocks.
    function renderTutorialBlocks() {
      if (!elements.menuTutorialBlocks) return;
      elements.menuTutorialBlocks.innerHTML = deps.tutorialOptions.map((tutorial, index) => (
        `<button type="button" data-menu-tutorial="${tutorial.id}" title="${tutorial.title}">${index + 1}</button>`
      )).join("");
    }

    return {
      showStart,
      showMain,
      enterGame,
      openPause,
      closePause,
      showLevelMenu,
      showTutorialMenu,
      openSettingsFromPause,
      toggleExpanded,
      render
    };
  }

  window.MenuSystem = { create };
}());
