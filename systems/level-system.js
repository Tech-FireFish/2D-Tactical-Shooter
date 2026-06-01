"use strict";

(function () {
  // Builds level loading, cloning, restart, and level navigation helpers.
  function create(deps) {
    const runtime = deps.runtime;
    const elements = deps.elements;
    const world = deps.world;

    // Creates a fresh playable runtime state for a level definition.
    function createGameState(level) {
      const firstOperator = level.operators[0];
      return {
        running: false,
        gameOver: false,
        result: null,
        debug: false,
        selectedId: firstOperator ? firstOperator.id : null,
        message: "Draw routes, then execute",
        shots: [],
        level: cloneLevel(level)
      };
    }

    // Deep-enough clones level data and applies current operator/enemy loadouts.
    function cloneLevel(level) {
      const maxOperators = Math.max(1, Math.min(runtime.activeOperatorCount, level.operators.length));
      const levelWeaponLoadouts = deps.equipment.currentLevelWeaponLoadouts();
      const levelArmorLoadouts = deps.equipment.currentLevelArmorLoadouts();
      return {
        id: level.id,
        title: level.title,
        width: level.width || deps.defaultWorld.w,
        height: level.height || deps.defaultWorld.h,
        floorZones: (level.floorZones || []).map((zone) => ({ ...zone })),
        walls: level.walls.map((wall) => ({ ...wall })),
        doors: level.doors.map((door) => ({
          ...door,
          password: door.lockType === "digital" ? (door.password || "0000") : door.password,
          locked: door.lockType === "digital" ? door.locked !== false : Boolean(door.locked)
        })),
        operators: level.operators.slice(0, maxOperators).map((op) => {
          const armorId = deps.equipment.validArmorId(deps.operatorArmorLoadouts[op.id] || op.armorId || "light-armor");
          const armor = deps.equipment.armorById(armorId);
          const baseSpeed = op.speed || 92;
          return {
            ...op,
            radius: deps.unitRadius,
            health: 100,
            armorId,
            armor: armor.armor,
            maxArmor: armor.armor,
            baseSpeed,
            speed: baseSpeed * armor.speedMultiplier,
            weaponId: deps.equipment.validWeaponId(deps.operatorLoadouts[op.id] || op.weaponId || "rifle"),
            fireTimer: 0,
            path: [],
            aim: 0,
            action: null,
            reaction: 0,
            targetId: null,
            down: false,
            routeIndex: 0
          };
        }),
        enemies: level.enemies.map((enemy) => {
          const weaponId = deps.equipment.validWeaponId(levelWeaponLoadouts[enemy.id] || enemy.weaponId || "rifle");
          const armorId = deps.equipment.validArmorId(levelArmorLoadouts[enemy.id] || enemy.armorId || "light-armor");
          const armor = deps.equipment.armorById(armorId);
          const baseSpeed = enemy.speed || 34;
          return {
            ...enemy,
            watch: enemy.watch ? { ...enemy.watch } : null,
            radius: 12,
            health: 100,
            armorId,
            armor: armor.armor,
            maxArmor: armor.armor,
            baseSpeed,
            speed: baseSpeed * armor.speedMultiplier,
            weaponId,
            fireTimer: 0,
            sightRange: enemy.sightRange || Math.max(190, deps.equipment.weaponById(weaponId).range),
            fov: Math.PI * 0.78,
            reaction: 0,
            targetId: null,
            down: false,
            patrolIndex: 0,
            status: "calm",
            lastKnownOperator: null,
            suspicionTimer: 0,
            searchTarget: null
          };
        }),
        objective: { ...level.objective }
      };
    }

    // Rebuilds the active level state and resets transient gameplay state.
    function restart() {
      if (!runtime.currentLevel) return;
      deps.keysDown.clear();
      runtime.state = createGameState(runtime.currentLevel);
      resizeWorld(runtime.state.level.width, runtime.state.level.height);
      runtime.lastTime = performance.now();
      elements.banner.classList.add("hidden");
      elements.levelTitle.textContent = runtime.currentLevel.title || runtime.currentLevelMeta.title;
      deps.updateHud();
    }

    // Resizes the canvas and world dimensions to match the loaded level.
    function resizeWorld(width, height) {
      world.w = width || deps.defaultWorld.w;
      world.h = height || deps.defaultWorld.h;
      elements.canvas.width = world.w;
      elements.canvas.height = world.h;
      elements.canvas.style.aspectRatio = `${world.w} / ${world.h}`;
    }

    // Finds the active level index in the level option list.
    function currentLevelIndex() {
      return Math.max(0, deps.levelOptions.findIndex((level) => level.id === runtime.currentLevelMeta.id));
    }

    // Fills the level selector from the configured level list.
    function populateLevelSelect() {
      elements.levelSelect.innerHTML = "";
      for (const level of deps.levelOptions) {
        const option = document.createElement("option");
        option.value = level.id;
        option.textContent = level.title;
        elements.levelSelect.append(option);
      }
    }

    // Fetches a level JSON file and starts it when loading succeeds.
    async function loadLevel(levelId) {
      const meta = deps.levelOptions.find((level) => level.id === levelId) || deps.levelOptions[0];
      runtime.currentLevelMeta = meta;
      elements.levelSelect.value = meta.id;
      elements.levelSelect.disabled = true;
      elements.levelTitle.textContent = "Loading...";

      try {
        const response = await fetch(meta.file, { cache: "no-store" });
        if (!response.ok) {
          throw new Error(`Unable to load ${meta.file}: ${response.status}`);
        }
        runtime.currentLevel = await response.json();
        runtime.currentLevel.id = runtime.currentLevel.id || meta.id;
        runtime.currentLevel.title = runtime.currentLevel.title || meta.title;
        restart();
      } catch (error) {
        runtime.currentLevel = null;
        runtime.state = null;
        elements.levelTitle.textContent = "Level Load Failed";
        elements.bannerTitle.textContent = "Level Load Failed";
        elements.bannerText.textContent = error.message;
        elements.banner.classList.remove("hidden");
      } finally {
        elements.levelSelect.disabled = false;
      }
    }

    // Advances to the next configured level, wrapping after the final level.
    function loadNextLevel() {
      if (!runtime.currentLevelMeta) return;
      const nextIndex = (currentLevelIndex() + 1) % deps.levelOptions.length;
      loadLevel(deps.levelOptions[nextIndex].id);
    }

    return {
      createGameState,
      cloneLevel,
      restart,
      resizeWorld,
      currentLevelIndex,
      populateLevelSelect,
      loadLevel,
      loadNextLevel
    };
  }

  window.LevelSystem = { create };
}());
