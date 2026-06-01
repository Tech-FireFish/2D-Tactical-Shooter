"use strict";

(function () {
  // Builds equipment loading, validation, loadout, and board rendering helpers.
  function create(deps) {
    const runtime = deps.runtime;
    const weapons = deps.weapons;
    const armors = deps.armors;
    const operatorLoadouts = deps.operatorLoadouts;
    const operatorArmorLoadouts = deps.operatorArmorLoadouts;
    const enemyLoadouts = deps.enemyLoadouts;
    const enemyArmorLoadouts = deps.enemyArmorLoadouts;
    const elements = deps.elements;
    let lastHealthBoardHtml = "";
    let lastEnemyLoadoutHtml = "";
    const weaponPixelArt = {
      rifle: [
        "................",
        "............aa..",
        "..bbbccccccccaa.",
        ".bbccccddddddaaa",
        "bbbccccccccccaa.",
        "...cc..ee........",
        "...cc...ee.......",
        "....c....ee......"
      ],
      smg: [
        "................",
        ".......aaa......",
        "..bbbccccccaaa..",
        ".bbbccccddddaaa.",
        "..bbccccccaaa...",
        ".....cc.ee......",
        ".....cc..ee.....",
        "..........ee...."
      ],
      pistol: [
        "................",
        "................",
        "....bbbccaaa....",
        "...bbbccccaaa...",
        ".....ccccaa.....",
        "......cc........",
        "......cee.......",
        ".......ee......."
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

    // Loads all weapon and armor JSON definitions from the equipment folder.
    async function loadEquipment() {
      weapons.clear();
      armors.clear();
      const loadedWeapons = await Promise.all(deps.weaponOptions.map(async (meta) => {
        const response = await fetch(meta.file, { cache: "no-store" });
        if (!response.ok) {
          throw new Error(`Unable to load ${meta.file}: ${response.status}`);
        }
        return response.json();
      }));
      const loadedArmors = await Promise.all(deps.armorOptions.map(async (meta) => {
        const response = await fetch(meta.file, { cache: "no-store" });
        if (!response.ok) {
          throw new Error(`Unable to load ${meta.file}: ${response.status}`);
        }
        return response.json();
      }));
      for (const weapon of loadedWeapons) {
        weapons.set(weapon.id, weapon);
      }
      for (const armor of loadedArmors) {
        armors.set(armor.id, armor);
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
      op.speed = (op.baseSpeed || 92) * armor.speedMultiplier;
      operatorArmorLoadouts[op.id] = selectedArmorId;
      runtime.state.message = `${op.id} equipped ${armor.name}`;
      deps.updateHud();
    }

    // Updates the selected operator loadout panel and equipment stats.
    function renderLoadoutPanel() {
      const state = runtime.state;
      if (!state) {
        elements.weaponSelect.disabled = true;
        elements.armorSelect.disabled = true;
        elements.selectedOperatorLabel.textContent = "Selected Operator";
        elements.weaponStats.textContent = "Loading...";
        renderWeaponPixelPreview(null);
        return;
      }
      const op = deps.selectedOperator();
      elements.weaponSelect.disabled = !op || op.down || state.gameOver;
      elements.armorSelect.disabled = !op || op.down || state.gameOver;
      elements.selectedOperatorLabel.textContent = op ? `${op.id} Weapon` : "Selected Operator";

      if (!op) {
        elements.weaponStats.textContent = "No operator selected.";
        renderWeaponPixelPreview(null);
        return;
      }

      elements.weaponSelect.value = validWeaponId(op.weaponId);
      elements.armorSelect.value = validArmorId(op.armorId);
      const weapon = weaponById(op.weaponId);
      const armor = armorById(op.armorId);
      if (!weapon || !armor) {
        elements.weaponStats.textContent = "Equipment data unavailable.";
        renderWeaponPixelPreview(null);
        return;
      }

      renderWeaponPixelPreview(weapon.id);
      elements.weaponStats.innerHTML = `
        <div>${weapon.role}</div>
        <div class="weapon-stat-row"><span>Range</span><strong>${weapon.range}</strong></div>
        <div class="weapon-stat-row"><span>Damage</span><strong>${weapon.damage}</strong></div>
        <div class="weapon-stat-row"><span>Fire Rate</span><strong>${(1 / weapon.fireInterval).toFixed(1)}/s</strong></div>
        <div class="weapon-stat-row"><span>Armor</span><strong>${armor.armor}</strong></div>
        <div class="weapon-stat-row"><span>Mobility</span><strong>${Math.round(armor.speedMultiplier * 100)}%</strong></div>
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

      const html = state.level.operators.map((op) => {
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
        elements.operatorHealthBoard.innerHTML = html;
        lastHealthBoardHtml = html;
      }
    }

    return {
      weaponById,
      validWeaponId,
      armorById,
      validArmorId,
      currentLevelWeaponLoadouts,
      currentLevelArmorLoadouts,
      weaponOptionsHtml,
      armorOptionsHtml,
      loadEquipment,
      populateEquipmentSelects,
      renderEnemyLoadouts,
      applyEnemyWeapon,
      applyEnemyArmor,
      applyOperatorArmor,
      renderLoadoutPanel,
      renderHealthBoard,
      renderWeaponPixelPreview
    };
  }

  window.EquipmentSystem = { create };
}());
