"use strict";

(function () {
  // Builds start, main, pause, expanded, and overlay navigation behavior.
  function create(deps) {
    const runtime = deps.runtime;
    const elements = deps.elements;

    // Shows the start screen at boot.
    function showStart() {
      document.documentElement.classList.add("start-menu-active");
      document.body.classList.add("start-menu-active");
      if (elements.startMenuOverlay) elements.startMenuOverlay.classList.remove("hidden");
      if (elements.mainMenuOverlay) elements.mainMenuOverlay.classList.add("hidden");
      if (elements.onboardingQuestion) elements.onboardingQuestion.classList.add("hidden");
      if (elements.startInfoPanel) elements.startInfoPanel.classList.add("hidden");
      if (deps.refreshStartMenu) deps.refreshStartMenu();
      closePause();
      if (runtime.state) runtime.state.running = false;
    }

    // Shows the main navigation page.
    function showMain(options = {}) {
      const returnToPause = Boolean(options.returnToPause);
      const returnResumeRunning = Boolean(options.resumeRunning);
      document.documentElement.classList.remove("start-menu-active");
      document.body.classList.remove("start-menu-active");
      if (elements.startMenuOverlay) elements.startMenuOverlay.classList.add("hidden");
      if (elements.onboardingQuestion) elements.onboardingQuestion.classList.add("hidden");
      if (elements.mainMenuOverlay) elements.mainMenuOverlay.classList.remove("hidden");
      closePause({ resume: false });
      runtime.menuReturnToPause = returnToPause;
      runtime.menuReturnResumeRunning = returnResumeRunning;
      if (runtime.state) runtime.state.running = false;
      render();
    }

    // Enters active gameplay from menus.
    function enterGame() {
      if (deps.settings && deps.settings.isOpen && deps.settings.isOpen()) deps.settings.closeSettings();
      document.documentElement.classList.remove("start-menu-active");
      document.body.classList.remove("start-menu-active");
      if (elements.startMenuOverlay) elements.startMenuOverlay.classList.add("hidden");
      if (elements.onboardingQuestion) elements.onboardingQuestion.classList.add("hidden");
      if (elements.mainMenuOverlay) elements.mainMenuOverlay.classList.add("hidden");
      runtime.menuReturnToPause = false;
      runtime.menuReturnResumeRunning = false;
      closePause();
      deps.updateHud();
    }

    // Opens pause navigation and freezes gameplay.
    function openPause(options = {}) {
      if (runtime.pauseOpen) return;
      runtime.pauseResumeRunning = typeof options.resumeRunning === "boolean"
        ? options.resumeRunning
        : Boolean(runtime.state && runtime.state.running);
      if (runtime.state) runtime.state.running = false;
      runtime.pauseOpen = true;
      runtime.expandedPaused = Boolean(runtime.expandedGame);
      document.body.classList.toggle("expanded-paused", runtime.expandedPaused);
      deps.keysDown.clear();
      elements.pauseOverlay.classList.remove("hidden");
      deps.updateHud();
    }

    // Closes pause navigation and optionally resumes gameplay.
    function closePause(options = {}) {
      if (!runtime.pauseOpen) return;
      const shouldResume = options.resume !== false;
      runtime.pauseOpen = false;
      runtime.expandedPaused = false;
      document.body.classList.remove("expanded-paused");
      elements.pauseOverlay.classList.add("hidden");
      if (shouldResume && runtime.state && !runtime.state.gameOver && runtime.pauseResumeRunning) runtime.state.running = true;
      runtime.pauseResumeRunning = false;
      deps.updateHud();
    }

    // Toggles pause navigation from Esc or the expanded PAUSE button.
    function togglePause() {
      if (runtime.pauseOpen) closePause();
      else openPause();
    }

    // Opens main page focused on levels.
    function showLevelMenu() {
      showMain({
        returnToPause: runtime.pauseOpen,
        resumeRunning: runtime.pauseResumeRunning
      });
    }

    // Opens main page focused on tutorials.
    function showTutorialMenu() {
      showMain({
        returnToPause: runtime.pauseOpen,
        resumeRunning: runtime.pauseResumeRunning
      });
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
      if (!next) {
        runtime.expandedPaused = false;
        document.body.classList.remove("expanded-paused");
      }
      document.body.classList.toggle("game-expanded", next);
      if (elements.expandedNav) elements.expandedNav.classList.toggle("hidden", !next);
      if (elements.expandGameButton) elements.expandGameButton.textContent = next ? "Collapse" : "Expand";
      if (deps.resizeCanvas) requestAnimationFrame(deps.resizeCanvas);
      deps.updateHud();
    }

    // Reports whether the main navigation page is currently visible.
    function isMainOpen() {
      return Boolean(elements.mainMenuOverlay && !elements.mainMenuOverlay.classList.contains("hidden"));
    }

    // Closes main navigation, returning to pause when it was opened from pause.
    function closeMainOverlay() {
      if (!isMainOpen()) return false;
      if (elements.mainMenuOverlay) elements.mainMenuOverlay.classList.add("hidden");
      if (runtime.menuReturnToPause) {
        const resumeRunning = Boolean(runtime.menuReturnResumeRunning);
        runtime.menuReturnToPause = false;
        runtime.menuReturnResumeRunning = false;
        openPause({ resumeRunning });
      } else {
        runtime.menuReturnToPause = false;
        runtime.menuReturnResumeRunning = false;
        if (runtime.state) runtime.state.running = false;
        deps.updateHud();
      }
      return true;
    }

    // Renders level/tutorial number blocks and privilege state.
    function render() {
      if (!runtime.gameDataReady) {
        if (elements.menuLevelBlocks) elements.menuLevelBlocks.innerHTML = "";
        if (elements.menuTutorialBlocks) elements.menuTutorialBlocks.innerHTML = "";
        if (elements.privilegeBoard) elements.privilegeBoard.innerHTML = "";
        return;
      }
      deps.progression.renderPrivilegeBoard();
      renderLevelBlocks();
      renderTutorialBlocks();
      if (elements.menuDifficultySelect) elements.menuDifficultySelect.value = runtime.currentDifficulty;
      if (elements.menuShootingModeSelect && runtime.state) elements.menuShootingModeSelect.value = runtime.state.shootingMode || "automatic";
    }

    // Renders story level number blocks.
    function renderLevelBlocks() {
      if (!elements.menuLevelBlocks) return;
      const progress = deps.progression.snapshot();
      elements.menuLevelBlocks.innerHTML = deps.levelOptions.map((level, index) => {
        const unlocked = deps.progression.isLevelUnlocked(index);
        const completed = progress.completedLevels.includes(level.id);
        const className = [unlocked ? "" : "locked", completed ? "completed" : ""].filter(Boolean).join(" ");
        return `<button type="button" data-menu-level="${level.id}" class="${className}" ${unlocked ? "" : "disabled"} title="${level.title}">${index + 1}</button>`;
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
      togglePause,
      toggleExpanded,
      isMainOpen,
      closeMainOverlay,
      render
    };
  }

  window.MenuSystem = { create };
}());
