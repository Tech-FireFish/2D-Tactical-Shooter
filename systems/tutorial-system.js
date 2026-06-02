"use strict";

(function () {
  // Builds guided tutorial card behavior for levels with tutorialSteps.
  function create(deps) {
    const runtime = deps.runtime;
    const elements = deps.elements;

    // Updates tutorial progress flags and renders the active step.
    function update() {
      const state = runtime.state;
      if (!state || !state.level.tutorialSteps || !state.level.tutorialSteps.length) {
        hide();
        return;
      }
      if (!state.tutorial) initState(state);
      updateFlags(state);
      render(state);
    }

    // Initializes per-level tutorial tracking.
    function initState(state) {
      state.tutorial = {
        completed: new Set(),
        inventoryOpened: false,
        lockOpened: false
      };
    }

    // Records state-driven tutorial completions.
    function updateFlags(state) {
      if (runtime.inventoryOpen) state.tutorial.inventoryOpened = true;
      if (runtime.digitalLockOpen) state.tutorial.lockOpened = true;
      for (const step of state.level.tutorialSteps) {
        if (stepComplete(state, step)) state.tutorial.completed.add(step.id);
      }
    }

    // Evaluates a level-authored completion condition.
    function stepComplete(state, step) {
      const op = selectedOperator(state);
      const door = step.doorId ? state.level.doors.find((item) => item.id === step.doorId) : null;
      const item = step.itemId ? state.level.items.find((target) => target.id === step.itemId) : null;
      if (step.completeWhen === "nearItem") return Boolean(op && item && deps.pointRectDistance(op, item) < 58);
      if (step.completeWhen === "itemPicked") return Boolean(item && item.picked);
      if (step.completeWhen === "inventoryOpened") return state.tutorial.inventoryOpened;
      if (step.completeWhen === "nearDoor") return Boolean(op && door && deps.pointRectDistance(op, door) < 62);
      if (step.completeWhen === "lockOpened") return state.tutorial.lockOpened;
      if (step.completeWhen === "doorUnlocked") return Boolean(door && door.locked === false);
      if (step.completeWhen === "doorOpen") return Boolean(door && door.state !== "closed");
      if (step.completeWhen === "objectiveSecured") return Boolean(state.level.objective.secured);
      return false;
    }

    // Finds the selected operator for distance-based checks.
    function selectedOperator(state) {
      return state.level.operators.find((op) => op.id === state.selectedId && !op.down)
        || state.level.operators.find((op) => !op.down);
    }

    // Renders the first incomplete step or final completion state.
    function render(state) {
      const steps = state.level.tutorialSteps;
      const index = steps.findIndex((step) => !state.tutorial.completed.has(step.id));
      const complete = index === -1;
      const step = complete ? steps[steps.length - 1] : steps[index];
      elements.tutorialCard.classList.remove("hidden");
      elements.tutorialTitle.textContent = complete ? "Tutorial Complete" : step.title;
      elements.tutorialText.textContent = complete ? "Digital lock cleared. Secure the objective or try another level." : step.text;
      elements.tutorialProgress.textContent = complete ? `${steps.length} / ${steps.length} Complete` : `Step ${index + 1} / ${steps.length}`;
    }

    // Hides tutorial UI when the active level has no tutorial data.
    function hide() {
      if (elements.tutorialCard) elements.tutorialCard.classList.add("hidden");
    }

    return {
      update,
      initState
    };
  }

  window.TutorialSystem = { create };
}());
