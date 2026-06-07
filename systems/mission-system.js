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

      const objectiveRadius = deps.objectScale ? deps.objectScale.scaledRadius(obj) : obj.radius;
      const opNear = state.level.operators.some((op) => {
        if (op.down) return false;
        const opRadius = deps.objectScale ? deps.objectScale.scaledRadius(op) : op.radius;
        return deps.geometry.pointDistance(op, obj) < opRadius + objectiveRadius + 6;
      });
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
      const tutorialSuccess = runtime.activeMode === "tutorial" && result === "success";
      const storySuccess = runtime.activeMode === "level" && result === "success";
      const tempSuccess = runtime.activeMode === "temp" && result === "success";
      const progress = storySuccess && deps.progression
        ? deps.progression.recordMission(runtime.currentLevelMeta, state.level)
        : { privilegeEarned: 0, rewardsUnlocked: [], complexity: deps.progression ? deps.progression.complexity(state.level) : 0 };
      elements.bannerTitle.textContent = title;
      elements.banner.classList.toggle("mission-success", result === "success");
      elements.banner.classList.toggle("mission-failure", result !== "success");
      if (tutorialSuccess) {
        const nextIndex = (deps.currentTutorialIndex() + 1) % deps.tutorialOptions.length;
        const nextTutorial = deps.tutorialOptions[nextIndex];
        elements.bannerText.textContent = `${text} Continue to ${nextTutorial.title}, exit to the main page, or restart this tutorial.`;
        elements.nextLevelButton.textContent = nextIndex === 0 ? "First Tutorial" : "Next Tutorial";
      } else if (tempSuccess) {
        elements.bannerText.textContent = `${text} Temporary test level complete. Choose another destination, return to the main page, or restart.`;
        elements.nextLevelButton.textContent = "First Level";
      } else {
        const nextIndex = (deps.currentLevelIndex() + 1) % deps.levelOptions.length;
        const nextLevel = deps.levelOptions[nextIndex];
        elements.bannerText.textContent = result === "success"
          ? `${text} Continue to ${nextLevel.title}, choose another level, or return to the main page.`
          : `${text} Choose another level, return to the main page, or restart.`;
        elements.nextLevelButton.textContent = nextIndex === 0 ? "First Level" : "Next Level";
      }
      if (elements.exitTutorialButton) elements.exitTutorialButton.classList.add("hidden");
      renderMissionReport(result, progress);
      populateResultSelector();
      elements.banner.classList.remove("hidden");
      deps.updateHud();
    }

    // Renders mission statistics and progression rewards in the result overlay.
    function renderMissionReport(result, progress) {
      if (!elements.missionReport) return;
      const neutralized = runtime.state.enemyDownCount || 0;
      const rewards = (progress.rewardsUnlocked || []).map((id) => deps.progression.label(id));
      elements.missionReport.innerHTML = `
        <div><span>Enemies Neutralized</span><strong>${neutralized}</strong></div>
        <div><span>Privilege Gained</span><strong>${progress.privilegeEarned || 0}</strong></div>
        <div><span>Complexity</span><strong>${progress.complexity || 0}</strong></div>
        <div><span>Rewards</span><strong>${result === "success" ? (rewards.join(", ") || "No new unlocks") : "None"}</strong></div>
      `;
      if (deps.progression && deps.progression.renderPrivilegeBoard) deps.progression.renderPrivilegeBoard();
    }

    // Populates the result-level picker with tutorial or story destinations.
    function populateResultSelector() {
      if (!elements.resultLevelSelect) return;
      const options = runtime.activeMode === "tutorial"
        ? deps.tutorialOptions
        : (runtime.activeMode === "temp" ? (deps.tempLevelOptions || []) : deps.levelOptions);
      elements.resultLevelSelect.innerHTML = options.map((option, index) => {
        const current = option.id === runtime.currentLevelMeta.id ? " selected" : "";
        return `<option value="${option.id}"${current}>${index + 1}. ${option.title}</option>`;
      }).join("");
    }

    return {
      updateObjective,
      checkMissionEnd,
      finishMission
    };
  }

  window.MissionSystem = { create };
}());
