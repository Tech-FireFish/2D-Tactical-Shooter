"use strict";

(function () {
  // Builds difficulty-aware visibility and fog-of-war helpers.
  function create(deps) {
    const runtime = deps.runtime;

    // Returns weapon range normally or the short difficult-mode sight range.
    function operatorSightRange(op) {
      if (runtime.currentDifficulty === "difficult") return deps.difficultOperatorSight;
      return deps.equipment.weaponById(op.weaponId).range;
    }

    // Checks whether at least one living operator can currently see a target.
    function visibleToOperators(target) {
      const state = runtime.state;
      if (runtime.currentDifficulty !== "difficult") return true;
      return state.level.operators.some((op) => {
        if (op.down) return false;
        return deps.geometry.pointDistance(op, target) <= operatorSightRange(op)
          && deps.geometry.hasLineOfSight(op, target, state.level);
      });
    }

    // Decides whether the VIP objective should be drawn in the current mode.
    function objectiveVisible() {
      const state = runtime.state;
      if (!state) return false;
      const obj = state.level.objective;
      return runtime.currentDifficulty !== "difficult" || obj.secured || obj.harmed || visibleToOperators(obj);
    }

    return {
      operatorSightRange,
      visibleToOperators,
      objectiveVisible
    };
  }

  window.VisibilitySystem = { create };
}());
