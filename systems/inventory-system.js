"use strict";

(function () {
  // Builds inventory overlays, paper pickup, and equipment-table behavior.
  function create(deps) {
    let openTableId = null;

    // Opens the selected operator inventory overlay.
    function openInventory() {
      const op = deps.selectedOperator();
      if (!op) return;
      deps.runtime.inventoryOpen = true;
      deps.runtime.inventoryResumeRunning = Boolean(deps.runtime.state && deps.runtime.state.running);
      if (deps.runtime.state) deps.runtime.state.running = false;
      deps.keysDown.clear();
      deps.elements.inventoryOverlay.classList.remove("hidden");
      renderInventory();
      deps.updateHud();
    }

    // Closes the inventory overlay and restores execution if needed.
    function closeInventory() {
      if (!deps.runtime.inventoryOpen) return;
      deps.runtime.inventoryOpen = false;
      deps.elements.inventoryOverlay.classList.add("hidden");
      if (deps.runtime.inventoryResumeRunning && deps.runtime.state && !deps.runtime.state.gameOver) {
        deps.runtime.state.running = true;
      }
      deps.runtime.inventoryResumeRunning = false;
      deps.updateHud();
    }

    // Renders full inventory details for the selected operator.
    function renderInventory() {
      const op = deps.selectedOperator();
      if (!op) return;
      const weapon = deps.equipment.weaponById(op.weaponId);
      const armor = deps.equipment.armorById(op.armorId);
      const backpack = deps.equipment.backpackById(op.backpackId);
      const items = op.inventory.items.length
        ? op.inventory.items.map((item) => `<li><strong>${item.name}</strong><span>${item.text || item.type}</span></li>`).join("")
        : "<li><strong>Empty</strong><span>No items carried</span></li>";
      deps.elements.inventoryTitle.textContent = `${op.id} Inventory`;
      deps.elements.inventoryDetails.innerHTML = `
        <div class="inventory-grid">
          <div><span>Weapon</span><strong>${weapon.name}</strong></div>
          <div><span>Armor</span><strong>${armor.name}</strong></div>
          <div><span>Backpack</span><strong>${backpack.name}</strong></div>
          <div><span>Ammo</span><strong>${op.ammo.magazine}/${weapon.magSize} + ${op.ammo.reserve}</strong></div>
          <div><span>Slots</span><strong>${op.inventory.items.length}/${op.inventory.slots}</strong></div>
        </div>
        <ul class="inventory-items">${items}</ul>
      `;
    }

    // Renders the compact sidebar inventory summary.
    function renderSummary() {
      const op = deps.selectedOperator();
      if (!op || !deps.elements.inventorySummary) {
        deps.elements.inventorySummary.innerHTML = "<p>No operator selected.</p>";
        return;
      }
      const backpack = deps.equipment.backpackById(op.backpackId);
      const papers = op.inventory.items.filter((item) => item.type === "paper").length;
      deps.elements.inventorySummary.innerHTML = `
        <div class="summary-row"><span>Backpack</span><strong>${backpack.name}</strong></div>
        <div class="summary-row"><span>Items</span><strong>${op.inventory.items.length}/${op.inventory.slots}</strong></div>
        <div class="summary-row"><span>Papers</span><strong>${papers}</strong></div>
      `;
    }

    // Attempts to pick up an item into the selected operator inventory.
    function pickItem(op, item) {
      const state = deps.runtime.state;
      if (!op || !item || item.picked) return false;
      if (op.inventory.items.length >= op.inventory.slots) {
        state.message = "Backpack full";
        deps.updateHud();
        return true;
      }
      item.picked = true;
      op.inventory.items.push({ id: item.id, type: item.type, name: item.name || item.id, text: item.text || "" });
      state.message = `${op.id} picked up ${item.name || item.id}`;
      renderSummary();
      deps.updateHud();
      return true;
    }

    // Opens an equipment table overlay for nearby table data.
    function openEquipmentTable(table) {
      if (!table) return;
      openTableId = table.id;
      deps.runtime.equipmentTableOpen = true;
      deps.runtime.equipmentTableResumeRunning = Boolean(deps.runtime.state && deps.runtime.state.running);
      if (deps.runtime.state) deps.runtime.state.running = false;
      deps.keysDown.clear();
      deps.elements.equipmentTableTitle.textContent = table.name || "Equipment Table";
      deps.elements.equipmentTableOverlay.classList.remove("hidden");
      renderEquipmentTable(table);
      deps.updateHud();
    }

    // Closes the equipment table overlay.
    function closeEquipmentTable() {
      if (!deps.runtime.equipmentTableOpen) return;
      deps.runtime.equipmentTableOpen = false;
      deps.elements.equipmentTableOverlay.classList.add("hidden");
      openTableId = null;
      if (deps.runtime.equipmentTableResumeRunning && deps.runtime.state && !deps.runtime.state.gameOver) {
        deps.runtime.state.running = true;
      }
      deps.runtime.equipmentTableResumeRunning = false;
      deps.updateHud();
    }

    // Renders buttons for equipment available at a table.
    function renderEquipmentTable(table) {
      const weaponButtons = deps.weaponOptions.map((meta) => deps.equipment.weaponById(meta.id)).map((weapon) => `
        <button type="button" data-table-equip="weapon" data-equip-id="${weapon.id}">${weapon.name}</button>
      `).join("");
      const armorButtons = deps.armorOptions.map((meta) => deps.equipment.armorById(meta.id)).map((armor) => `
        <button type="button" data-table-equip="armor" data-equip-id="${armor.id}">${armor.name}</button>
      `).join("");
      const backpackButtons = deps.backpackOptions.map((meta) => deps.equipment.backpackById(meta.id)).map((pack) => `
        <button type="button" data-table-equip="backpack" data-equip-id="${pack.id}">${pack.name}</button>
      `).join("");
      deps.elements.equipmentTableOptions.innerHTML = `
        <section><h3>Weapons</h3>${weaponButtons}</section>
        <section><h3>Armor</h3>${armorButtons}</section>
        <section><h3>Backpacks</h3>${backpackButtons}</section>
      `;
    }

    // Equips the selected operator from a table button.
    function equipFromTable(type, id) {
      const op = deps.selectedOperator();
      if (!op) return;
      if (type === "weapon") {
        deps.equipment.applyOperatorWeapon(op, id);
      } else if (type === "armor") {
        deps.equipment.applyOperatorArmor(op, id);
      } else if (type === "backpack") {
        deps.equipment.applyOperatorBackpack(op, id);
      }
      renderInventory();
      renderSummary();
    }

    // Finds the currently open equipment table.
    function currentTable() {
      const state = deps.runtime.state;
      return state && openTableId ? (state.level.equipmentTables || []).find((table) => table.id === openTableId) : null;
    }

    return {
      openInventory,
      closeInventory,
      renderInventory,
      renderSummary,
      pickItem,
      openEquipmentTable,
      closeEquipmentTable,
      renderEquipmentTable,
      equipFromTable,
      currentTable
    };
  }

  window.InventorySystem = { create };
}());
