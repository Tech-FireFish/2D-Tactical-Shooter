"use strict";

(function () {
  // Builds equipment loading, validation, loadout, and board rendering helpers.
  function create(deps) {
    const runtime = deps.runtime;
    const weapons = deps.weapons;
    const armors = deps.armors;
    const backpacks = deps.backpacks;
    const operatorLoadouts = deps.operatorLoadouts;
    const operatorArmorLoadouts = deps.operatorArmorLoadouts;
    const operatorBackpackLoadouts = deps.operatorBackpackLoadouts;
    const enemyLoadouts = deps.enemyLoadouts;
    const enemyArmorLoadouts = deps.enemyArmorLoadouts;
    const elements = deps.elements;
    let lastHealthBoardHtml = "";
    let lastEnemyLoadoutHtml = "";
    const weaponPixelArt = {
      rifle: [
        "....................",
        "...............aa...",
        "...bbbccccccccccaa..",
        "..bbccccddddddddaaa.",
        ".bbbccccccccccccaa..",
        ".....cc..ee.........",
        ".....cc...ee........",
        "......c....ee......."
      ],
      smg: [
        "....................",
        ".........aaa........",
        "...bbbccccccaaa.....",
        "..bbbccccddddaaa....",
        "...bbccccccaaa......",
        "......cc.ee.........",
        "......cc..ee........",
        "...........ee......."
      ],
      pistol: [
        "....................",
        "....................",
        "......bbbccaaa......",
        ".....bbbccccaaa.....",
        ".......ccccaa.......",
        "........cc..........",
        "........cee.........",
        ".........ee........."
      ]
    };

    // Resolves a weapon definition, falling back to rifle.
    function weaponById(id) {
      return weapons.get(id) || weapons.get("rifle");
    }

    // Normalizes unknown weapon IDs to the default rifle.
    function validWeaponId(id) {
      return weapons.has(id) ? id : "rifle";
    }

    // Resolves an armor definition, falling back to light armor.
    function armorById(id) {
      return armors.get(id) || armors.get("light-armor");
    }

    // Normalizes unknown armor IDs to the default light armor.
    function validArmorId(id) {
      return armors.has(id) ? id : "light-armor";
    }

    // Resolves a backpack definition, falling back to medium backpack.
    function backpackById(id) {
      return backpacks.get(id) || backpacks.get("medium-backpack");
    }

    // Normalizes unknown backpack IDs to the default medium backpack.
    function validBackpackId(id) {
      return backpacks.has(id) ? id : "medium-backpack";
    }

    // Gets the saved enemy weapon choices for the active level.
    function currentLevelWeaponLoadouts() {
      const levelId = runtime.currentLevelMeta ? runtime.currentLevelMeta.id : "default";
      if (!enemyLoadouts[levelId]) enemyLoadouts[levelId] = {};
      return enemyLoadouts[levelId];
    }

    // Gets the saved enemy armor choices for the active level.
    function currentLevelArmorLoadouts() {
      const levelId = runtime.currentLevelMeta ? runtime.currentLevelMeta.id : "default";
      if (!enemyArmorLoadouts[levelId]) enemyArmorLoadouts[levelId] = {};
      return enemyArmorLoadouts[levelId];
    }

    // Produces weapon selector options for loadout controls.
    function weaponOptionsHtml(selectedId) {
      return deps.weaponOptions.map((meta) => {
        const weapon = weapons.get(meta.id);
        if (!weapon) return "";
        const selected = weapon.id === selectedId ? " selected" : "";
        return `<option value="${weapon.id}"${selected}>${weapon.name}</option>`;
      }).join("");
    }

    // Produces armor selector options for loadout controls.
    function armorOptionsHtml(selectedId) {
      return deps.armorOptions.map((meta) => {
        const armor = armors.get(meta.id);
        if (!armor) return "";
        const selected = armor.id === selectedId ? " selected" : "";
        return `<option value="${armor.id}"${selected}>${armor.name}</option>`;
      }).join("");
    }

    // Produces backpack selector options for loadout controls.
    function backpackOptionsHtml(selectedId) {
      return deps.backpackOptions.map((meta) => {
        const backpack = backpacks.get(meta.id);
        if (!backpack) return "";
        const selected = backpack.id === selectedId ? " selected" : "";
        return `<option value="${backpack.id}"${selected}>${backpack.name}</option>`;
      }).join("");
    }

    // Loads all weapon and armor JSON definitions from the equipment folder.
    async function loadEquipment() {
      weapons.clear();
      armors.clear();
      backpacks.clear();
      const demoEquipment = window.DemoData && window.DemoData.equipment;
      if (!demoEquipment) {
        throw new Error("Demo equipment data unavailable");
      }
      const loadedWeapons = deps.weaponOptions.map((meta) => {
        const item = demoEquipment[meta.id];
        if (!item) throw new Error(`Unable to load ${meta.id}`);
        return { ...item };
      });
      const loadedArmors = deps.armorOptions.map((meta) => {
        const item = demoEquipment[meta.id];
        if (!item) throw new Error(`Unable to load ${meta.id}`);
        return { ...item };
      });
      const loadedBackpacks = deps.backpackOptions.map((meta) => {
        const item = demoEquipment[meta.id];
        if (!item) throw new Error(`Unable to load ${meta.id}`);
        return { ...item };
      });
      for (const weapon of loadedWeapons) {
        weapons.set(weapon.id, weapon);
      }
      for (const armor of loadedArmors) {
        armors.set(armor.id, armor);
      }
      for (const backpack of loadedBackpacks) {
        backpacks.set(backpack.id, backpack);
      }
      populateEquipmentSelects();
    }

    // Fills the operator weapon and armor select elements.
    function populateEquipmentSelects() {
      elements.weaponSelect.innerHTML = "";
      for (const meta of deps.weaponOptions) {
        const weapon = weapons.get(meta.id);
        if (!weapon) continue;
        const option = document.createElement("option");
        option.value = weapon.id;
        option.textContent = weapon.name;
        elements.weaponSelect.append(option);
      }
      elements.armorSelect.innerHTML = "";
      for (const meta of deps.armorOptions) {
        const armor = armors.get(meta.id);
        if (!armor) continue;
        const option = document.createElement("option");
        option.value = armor.id;
        option.textContent = armor.name;
        elements.armorSelect.append(option);
      }
      elements.backpackSelect.innerHTML = "";
      for (const meta of deps.backpackOptions) {
        const backpack = backpacks.get(meta.id);
        if (!backpack) continue;
        const option = document.createElement("option");
        option.value = backpack.id;
        option.textContent = backpack.name;
        elements.backpackSelect.append(option);
      }
    }

    // Renders enemy weapon and armor controls in the settings panel.
    function renderEnemyLoadouts() {
      const state = runtime.state;
      if (!state) {
        if (lastEnemyLoadoutHtml) {
          elements.enemyLoadoutList.innerHTML = "";
          lastEnemyLoadoutHtml = "";
        }
        return;
      }

      const savedWeapons = currentLevelWeaponLoadouts();
      const savedArmors = currentLevelArmorLoadouts();
      const html = state.level.enemies.map((enemy) => {
        const selectedWeaponId = validWeaponId(savedWeapons[enemy.id] || enemy.weaponId || "rifle");
        const selectedArmorId = validArmorId(savedArmors[enemy.id] || enemy.armorId || "light-armor");
        return `
          <div class="enemy-loadout-row">
            <strong>${enemy.id}</strong>
            <select data-enemy-weapon-id="${enemy.id}" aria-label="${enemy.id} weapon">
              ${weaponOptionsHtml(selectedWeaponId)}
            </select>
            <select data-enemy-armor-id="${enemy.id}" aria-label="${enemy.id} armor">
              ${armorOptionsHtml(selectedArmorId)}
            </select>
          </div>
        `;
      }).join("");

      if (html !== lastEnemyLoadoutHtml) {
        elements.enemyLoadoutList.innerHTML = html || "<p class=\"empty-note\">No enemies in this level.</p>";
        lastEnemyLoadoutHtml = html;
      }
    }

    // Applies an enemy weapon choice and resets its firing timers.
    function applyEnemyWeapon(enemyId, weaponId) {
      const selectedWeaponId = validWeaponId(weaponId);
      currentLevelWeaponLoadouts()[enemyId] = selectedWeaponId;
      const state = runtime.state;
      if (!state) return;
      const enemy = state.level.enemies.find((item) => item.id === enemyId);
      if (!enemy) return;
      enemy.weaponId = selectedWeaponId;
      enemy.fireTimer = 0;
      enemy.reaction = 0;
      enemy.sightRange = Math.max(190, weaponById(selectedWeaponId).range);
      state.message = `${enemy.id} equipped ${weaponById(selectedWeaponId).name}`;
      deps.updateHud();
    }

    // Applies enemy armor values and speed effects.
    function applyEnemyArmor(enemyId, armorId) {
      const selectedArmorId = validArmorId(armorId);
      currentLevelArmorLoadouts()[enemyId] = selectedArmorId;
      const state = runtime.state;
      if (!state) return;
      const enemy = state.level.enemies.find((item) => item.id === enemyId);
      if (!enemy) return;
      const armor = armorById(selectedArmorId);
      enemy.armorId = selectedArmorId;
      enemy.maxArmor = armor.armor;
      enemy.armor = armor.armor;
      enemy.speed = (enemy.baseSpeed || 34) * armor.speedMultiplier;
      state.message = `${enemy.id} equipped ${armor.name}`;
      deps.updateHud();
    }

    // Applies operator armor values, speed effects, and saved loadout state.
    function applyOperatorArmor(op, armorId) {
      const selectedArmorId = validArmorId(armorId);
      const armor = armorById(selectedArmorId);
      op.armorId = selectedArmorId;
      op.maxArmor = armor.armor;
      op.armor = armor.armor;
      const backpack = backpackById(op.backpackId);
      op.speed = (op.baseSpeed || 92) * armor.speedMultiplier * (backpack.speedMultiplier || 1);
      operatorArmorLoadouts[op.id] = selectedArmorId;
      runtime.state.message = `${op.id} equipped ${armor.name}`;
      deps.updateHud();
    }

    // Applies an operator weapon choice and refreshes ammunition.
    function applyOperatorWeapon(op, weaponId) {
      const selectedWeaponId = validWeaponId(weaponId);
      op.weaponId = selectedWeaponId;
      op.fireTimer = 0;
      op.reaction = 0;
      operatorLoadouts[op.id] = selectedWeaponId;
      deps.shooting.resetAmmo(op);
      runtime.state.message = `${op.id} equipped ${weaponById(op.weaponId).name}`;
      deps.updateHud();
    }

    // Applies an operator backpack choice and refreshes ammo and storage.
    function applyOperatorBackpack(op, backpackId) {
      const selectedBackpackId = validBackpackId(backpackId);
      const backpack = backpackById(selectedBackpackId);
      const armor = armorById(op.armorId);
      op.backpackId = selectedBackpackId;
      op.speed = (op.baseSpeed || 92) * armor.speedMultiplier * (backpack.speedMultiplier || 1);
      op.inventory.slots = backpack.slots;
      if (op.inventory.items.length > op.inventory.slots) {
        op.inventory.items = op.inventory.items.slice(0, op.inventory.slots);
      }
      operatorBackpackLoadouts[op.id] = selectedBackpackId;
      deps.shooting.resetAmmo(op);
      runtime.state.message = `${op.id} equipped ${backpack.name}`;
      deps.updateHud();
    }

    // Updates the selected operator loadout panel and equipment stats.
    function renderLoadoutPanel() {
      const state = runtime.state;
      if (!state) {
        elements.weaponSelect.disabled = true;
        elements.armorSelect.disabled = true;
        elements.backpackSelect.disabled = true;
        elements.selectedOperatorLabel.textContent = "Selected Operator";
        if (elements.settingsSelectedOperatorLabel) elements.settingsSelectedOperatorLabel.textContent = "Selected Operator Weapon";
        elements.weaponStats.textContent = "Loading...";
        renderWeaponPixelPreview(null);
        renderAmmoBoard(null);
        return;
      }
      const op = deps.selectedOperator();
      elements.weaponSelect.disabled = !op || op.down || state.gameOver;
      elements.armorSelect.disabled = !op || op.down || state.gameOver;
      elements.backpackSelect.disabled = !op || op.down || state.gameOver;
      elements.selectedOperatorLabel.textContent = op ? `${op.id} Weapon` : "Selected Operator";
      if (elements.settingsSelectedOperatorLabel) elements.settingsSelectedOperatorLabel.textContent = op ? `${op.id} Weapon` : "Selected Operator Weapon";

      if (!op) {
        elements.weaponStats.textContent = "No operator selected.";
        renderWeaponPixelPreview(null);
        renderAmmoBoard(null);
        return;
      }

      elements.weaponSelect.value = validWeaponId(op.weaponId);
      elements.armorSelect.value = validArmorId(op.armorId);
      elements.backpackSelect.value = validBackpackId(op.backpackId);
      const weapon = weaponById(op.weaponId);
      const armor = armorById(op.armorId);
      const backpack = backpackById(op.backpackId);
      if (!weapon || !armor || !backpack) {
        elements.weaponStats.textContent = "Equipment data unavailable.";
        renderWeaponPixelPreview(null);
        renderAmmoBoard(null);
        return;
      }

      renderWeaponPixelPreview(weapon.id);
      renderAmmoBoard(op);
      elements.weaponStats.innerHTML = `
        <div>${weapon.role}</div>
        <div class="weapon-stat-row"><span>Range</span><strong>${weapon.range}</strong></div>
        <div class="weapon-stat-row"><span>Damage</span><strong>${weapon.damage}</strong></div>
        <div class="weapon-stat-row"><span>Fire Rate</span><strong>${(1 / weapon.fireInterval).toFixed(1)}/s</strong></div>
        <div class="weapon-stat-row"><span>Magazine</span><strong>${weapon.magSize}</strong></div>
        <div class="weapon-stat-row"><span>Armor</span><strong>${armor.armor}</strong></div>
        <div class="weapon-stat-row"><span>Backpack</span><strong>${backpack.slots} slots</strong></div>
        <div class="weapon-stat-row"><span>Mobility</span><strong>${Math.round(armor.speedMultiplier * (backpack.speedMultiplier || 1) * 100)}%</strong></div>
      `;
    }

    // Renders magazine and carried bullet indicators for the selected operator.
    function renderAmmoBoard(op) {
      if (!elements.ammoBoard) return;
      if (!op || !op.ammo) {
        elements.ammoBoard.innerHTML = "<span>No ammo data</span>";
        return;
      }
      const weapon = weaponById(op.weaponId);
      const bullets = Array.from({ length: weapon.magSize || 20 }, (_, index) => {
        const filled = index < op.ammo.magazine ? " filled" : "";
        return `<span class="bullet${filled}" aria-hidden="true"></span>`;
      }).join("");
      elements.ammoBoard.innerHTML = `
        <div class="bullet-grid">${bullets}</div>
        <div class="ammo-count">${op.ammo.magazine}/${weapon.magSize} | Reserve ${op.ammo.reserve}</div>
        ${op.ammo.reloading ? "<div class=\"reload-label\">Reloading</div>" : ""}
      `;
    }

    // Renders the selected weapon as compact CSS pixel art.
    function renderWeaponPixelPreview(weaponId) {
      const selectedWeaponId = weaponId && weaponPixelArt[weaponId] ? weaponId : null;
      const pattern = selectedWeaponId ? weaponPixelArt[selectedWeaponId] : null;
      if (!pattern || !elements.weaponPixelPreview) {
        elements.weaponPixelPreview.innerHTML = "<span class=\"weapon-pixel-empty\">No Weapon</span>";
        elements.weaponPixelPreview.classList.add("empty");
        return;
      }
      const pixels = pattern.flatMap((row) => row.split("")).map((cell) => {
        const className = cell === "." ? "px empty-pixel" : `px tone-${cell}`;
        return `<span class="${className}" aria-hidden="true"></span>`;
      }).join("");
      elements.weaponPixelPreview.classList.remove("empty");
      elements.weaponPixelPreview.innerHTML = `
        <div class="weapon-pixel-grid weapon-pixel-${selectedWeaponId}" role="img" aria-label="${weaponById(selectedWeaponId).name} pixel preview">
          ${pixels}
        </div>
      `;
    }

    // Renders operator armor, health, weapon, and alive/down state cards.
    function renderHealthBoard() {
      const state = runtime.state;
      if (!state) {
        if (lastHealthBoardHtml) {
          elements.operatorHealthBoard.innerHTML = "";
          lastHealthBoardHtml = "";
        }
        return;
      }

      const selected = deps.selectedOperator();
      const visibleOperators = runtime.showAllHealth
        ? state.level.operators
        : state.level.operators.filter((op) => op.id === state.selectedId || op.movedBefore);
      const html = visibleOperators.map((op) => {
        const weapon = weaponById(op.weaponId);
        const health = Math.max(0, Math.min(100, op.health));
        const armorPercent = op.maxArmor > 0 ? Math.max(0, Math.min(100, (op.armor / op.maxArmor) * 100)) : 0;
        const classes = [
          "operator-card",
          op.id === state.selectedId ? "selected" : "",
          op.down ? "down" : ""
        ].filter(Boolean).join(" ");
        return `
          <button class="${classes}" type="button" data-operator-id="${op.id}">
            <span class="operator-row">
              <strong>${op.id}</strong>
              <span>${op.down ? "Down" : "Alive"}</span>
            </span>
            <span class="health-meter" aria-hidden="true">
              <span class="armor-fill" style="width: ${armorPercent}%"></span>
            </span>
            <span class="operator-row">
              <span>${armorById(op.armorId).name}</span>
              <span>${op.armor.toFixed(0)} AR</span>
            </span>
            <span class="health-meter" aria-hidden="true">
              <span class="health-fill" style="width: ${health}%"></span>
            </span>
            <span class="operator-row">
              <span>${weapon ? weapon.name : "Rifle"}</span>
              <span>${health.toFixed(0)} HP</span>
            </span>
          </button>
        `;
      }).join("");

      if (html !== lastHealthBoardHtml) {
        elements.operatorHealthBoard.innerHTML = html || (selected ? "" : "<p class=\"empty-note\">No operator selected.</p>");
        lastHealthBoardHtml = html;
      }
      if (elements.showAllHealthButton) {
        elements.showAllHealthButton.textContent = runtime.showAllHealth ? "Selected" : "Show All";
      }
    }

    return {
      weaponById,
      validWeaponId,
      armorById,
      validArmorId,
      backpackById,
      validBackpackId,
      currentLevelWeaponLoadouts,
      currentLevelArmorLoadouts,
      weaponOptionsHtml,
      armorOptionsHtml,
      backpackOptionsHtml,
      loadEquipment,
      populateEquipmentSelects,
      renderEnemyLoadouts,
      applyEnemyWeapon,
      applyEnemyArmor,
      applyOperatorWeapon,
      applyOperatorArmor,
      applyOperatorBackpack,
      renderLoadoutPanel,
      renderHealthBoard,
      renderWeaponPixelPreview,
      renderAmmoBoard
    };
  }

  window.EquipmentSystem = { create };
}());
