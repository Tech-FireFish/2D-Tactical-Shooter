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
        shootingMode: runtime.state ? runtime.state.shootingMode || "automatic" : "automatic",
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
        rooms: (level.rooms || []).map((room) => ({ ...room })),
        labels: (level.labels || []).map((label) => ({ ...label })),
        walls: level.walls.map((wall) => ({ ...wall })),
        windows: (level.windows || []).map((win) => ({ ...win, state: win.state || "closed" })),
        stairs: (level.stairs || []).map((stair) => ({ ...stair, target: stair.target ? { ...stair.target } : null })),
        items: buildItems(level),
        equipmentTables: (level.equipmentTables || []).map((table) => ({ ...table })),
        doors: buildDoors(level),
        operators: level.operators.slice(0, maxOperators).map((op) => {
          const armorId = deps.equipment.validArmorId(deps.operatorArmorLoadouts[op.id] || op.armorId || "light-armor");
          const backpackId = deps.equipment.validBackpackId(deps.operatorBackpackLoadouts[op.id] || op.backpackId || "medium-backpack");
          const armor = deps.equipment.armorById(armorId);
          const backpack = deps.equipment.backpackById(backpackId);
          const baseSpeed = op.speed || 92;
          const unit = {
            ...op,
            kind: "operator",
            radius: deps.unitRadius,
            health: 100,
            armorId,
            armor: armor.armor,
            maxArmor: armor.armor,
            backpackId,
            baseSpeed,
            speed: baseSpeed * armor.speedMultiplier * (backpack.speedMultiplier || 1),
            weaponId: deps.equipment.validWeaponId(deps.operatorLoadouts[op.id] || op.weaponId || "rifle"),
            fireTimer: 0,
            path: [],
            aim: 0,
            action: null,
            reaction: 0,
            targetId: null,
            down: false,
            routeIndex: 0,
            movedBefore: false,
            floor: op.floor || "Floor 1",
            zone: op.zone || "Entry",
            inventory: {
              slots: backpack.slots,
              items: []
            }
          };
          deps.shooting.resetAmmo(unit);
          return unit;
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

    // Builds door clones and generates fresh digital passwords on every restart.
    function buildDoors(level) {
      const passwords = {};
      const doors = level.doors.map((door) => {
        const password = door.lockType === "digital" ? randomPassword() : door.password;
        if (door.lockType === "digital") passwords[door.id] = password;
        return {
          ...door,
          password,
          locked: door.lockType === "digital" ? door.locked !== false : Boolean(door.locked)
        };
      });
      runtime.generatedPasswords = passwords;
      return doors;
    }

    // Builds item clones and injects paper clues for each generated digital door password.
    function buildItems(level) {
      const baseItems = (level.items || []).map((item) => ({ ...item, picked: false }));
      const digitalDoors = level.doors.filter((door) => door.lockType === "digital");
      return baseItems.map((item) => ({ ...item }));
    }

    // Applies generated passwords to paper notes after door generation.
    function syncPaperClues(stateLevel) {
      const doors = stateLevel.doors.filter((door) => door.lockType === "digital");
      for (const door of doors) {
        let paper = stateLevel.items.find((item) => item.type === "paper" && item.passwordFor === door.id);
        if (!paper) {
          const firstOp = stateLevel.operators[0] || { x: 80, y: 80 };
          paper = {
            id: `paper-${door.id}`,
            type: "paper",
            name: `${door.id} Code Paper`,
            x: firstOp.x + 20,
            y: firstOp.y - 42,
            w: 22,
            h: 18,
            passwordFor: door.id,
            picked: false
          };
          stateLevel.items.push(paper);
        }
        paper.text = `${door.id} code: ${door.password}`;
      }
    }

    // Generates a random four-digit digital lock password.
    function randomPassword() {
      return String(Math.floor(Math.random() * 10000)).padStart(4, "0");
    }

    // Rebuilds the active level state and resets transient gameplay state.
    function restart() {
      if (!runtime.currentLevel) return;
      deps.keysDown.clear();
      runtime.state = createGameState(runtime.currentLevel);
      syncPaperClues(runtime.state.level);
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
      elements.canvas.width = deps.defaultWorld.w;
      elements.canvas.height = deps.defaultWorld.h;
      elements.canvas.style.aspectRatio = `${deps.defaultWorld.w} / ${deps.defaultWorld.h}`;
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

    // Loads an embedded demo level and starts it when loading succeeds.
    async function loadLevel(levelId) {
      const meta = deps.levelOptions.find((level) => level.id === levelId) || deps.levelOptions[0];
      runtime.currentLevelMeta = meta;
      elements.levelSelect.value = meta.id;
      elements.levelSelect.disabled = true;
      elements.levelTitle.textContent = "Loading...";

      try {
        const sourceLevel = window.DemoData && window.DemoData.levels && window.DemoData.levels[meta.id];
        if (!sourceLevel) {
          throw new Error(`Unable to load ${meta.id}`);
        }
        runtime.currentLevel = JSON.parse(JSON.stringify(sourceLevel));
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
