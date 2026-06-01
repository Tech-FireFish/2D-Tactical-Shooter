"use strict";

(function () {
  // Builds difficulty-aware visibility and fog-of-war helpers.
  function create(deps) {
    const runtime = deps.runtime;

    // Returns weapon range normally or the short difficult-mode sight range.
    function operatorSightRange(op) {
      if (runtime.currentDifficulty === "difficult") return deps.difficultOperatorSight;
      return Math.max(230, deps.equipment.weaponById(op.weaponId).range);
    }

    // Checks whether the selected living operator can currently see a target.
    function visibleToOperators(target) {
      const state = runtime.state;
      if (!state) return false;
      const selected = state.level.operators.find((op) => op.id === state.selectedId && !op.down)
        || state.level.operators.find((op) => !op.down);
      if (!selected) return false;
      return deps.geometry.pointDistance(selected, target) <= operatorSightRange(selected)
        && deps.geometry.hasLineOfSight(selected, target, state.level);
    }

    // Decides whether the VIP objective should be drawn in the current mode.
    function objectiveVisible() {
      const state = runtime.state;
      if (!state) return false;
      const obj = state.level.objective;
      return obj.secured || obj.harmed || visibleToOperators(obj);
    }

    return {
      operatorSightRange,
      visibleToOperators,
      objectiveVisible
    };
  }

  window.VisibilitySystem = { create };
}());
