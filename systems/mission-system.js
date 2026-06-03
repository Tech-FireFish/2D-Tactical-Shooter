"use strict";

(function () {
  // Builds mission objective, win, and failure state helpers.
  function create(deps) {
    const runtime = deps.runtime;
    const elements = deps.elements;

    // Secures the VIP objective when a living operator gets close enough.
    function updateObjective() {
      const state = runtime.state;
      const obj = state.level.objective;
      if (obj.secured || obj.harmed) return;

      const opNear = state.level.operators.some((op) => !op.down && deps.geometry.pointDistance(op, obj) < 34);
      if (opNear) {
        if (deps.tutorial && deps.tutorial.shouldGateObjective(state)) {
          deps.tutorial.recordPrematureObjectiveTouch(state);
          return;
        }
        obj.secured = true;
      }
    }

    // Evaluates success and failure conditions after gameplay updates.
    function checkMissionEnd() {
      const state = runtime.state;
      if (state.gameOver) return;
      const liveOps = state.level.operators.some((op) => !op.down);
      const allEnemiesDown = state.level.enemies.length > 0
        && !state.level.requireObjective
        && state.level.enemies.every((enemy) => !enemy.respawnDelay)
        && state.level.enemies.every((enemy) => enemy.down);
      if (state.level.objective.secured || allEnemiesDown) {
        finishMission("success", "Mission Complete", "Objective secured. The route held together.");
      } else if (!liveOps || state.level.objective.harmed) {
        finishMission("failure", "Mission Failed", "Restart and adjust the entry plan.");
      }
    }

    // Freezes gameplay and displays the post-mission result overlay.
    function finishMission(result, title, text) {
      const state = runtime.state;
      state.gameOver = true;
      state.running = false;
      state.result = result;
      deps.audio.play(result === "success" ? "mission-success" : "mission-failed");
      elements.bannerTitle.textContent = title;
      const tutorialSuccess = runtime.activeMode === "tutorial" && result === "success";
      if (tutorialSuccess) {
        const nextIndex = (deps.currentTutorialIndex() + 1) % deps.tutorialOptions.length;
        const nextTutorial = deps.tutorialOptions[nextIndex];
        const firstLevel = deps.levelOptions[0];
        elements.bannerText.textContent = `${text} Continue to ${nextTutorial.title}, exit to ${firstLevel.title}, or restart this tutorial.`;
        elements.nextLevelButton.textContent = nextIndex === 0 ? "First Tutorial" : "Next Tutorial";
        if (elements.exitTutorialButton) {
          elements.exitTutorialButton.textContent = "Exit To First Level";
          elements.exitTutorialButton.classList.remove("hidden");
        }
      } else {
        const nextIndex = (deps.currentLevelIndex() + 1) % deps.levelOptions.length;
        const nextLevel = deps.levelOptions[nextIndex];
        elements.bannerText.textContent = `${text} Continue to ${nextLevel.title} or restart this level.`;
        elements.nextLevelButton.textContent = nextIndex === 0 ? "First Level" : "Next Level";
        if (elements.exitTutorialButton) elements.exitTutorialButton.classList.add("hidden");
      }
      elements.banner.classList.remove("hidden");
      deps.updateHud();
    }

    return {
      updateObjective,
      checkMissionEnd,
      finishMission
    };
  }

  window.MissionSystem = { create };
}());
