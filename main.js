"use strict";

const elements = {
  canvas: document.getElementById("game"),
  startMenuOverlay: document.getElementById("startMenuOverlay"),
  playMenuButton: document.getElementById("playMenuButton"),
  startSettingButton: document.getElementById("startSettingButton"),
  startInfoButton: document.getElementById("startInfoButton"),
  startExitButton: document.getElementById("startExitButton"),
  startExitMessage: document.getElementById("startExitMessage"),
  startInfoPanel: document.getElementById("startInfoPanel"),
  closeStartInfoButton: document.getElementById("closeStartInfoButton"),
  onboardingQuestion: document.getElementById("onboardingQuestion"),
  closeOnboardingButton: document.getElementById("closeOnboardingButton"),
  playedYesButton: document.getElementById("playedYesButton"),
  playedNoButton: document.getElementById("playedNoButton"),
  storeMenuOverlay: document.getElementById("storeMenuOverlay"),
  storeProfileAvatar: document.getElementById("storeProfileAvatar"),
  storeProfileName: document.getElementById("storeProfileName"),
  storeProfileId: document.getElementById("storeProfileId"),
  storeScoreValue: document.getElementById("storeScoreValue"),
  storeMessage: document.getElementById("storeMessage"),
  storeEquipmentGrid: document.getElementById("storeEquipmentGrid"),
  // storeDetailPanel: document.getElementById("storeDetailPanel"),
  storeConfirmPopup: document.getElementById("storeConfirmPopup"),
  storeConfirmText: document.getElementById("storeConfirmText"),
  storeCancelPurchaseButton: document.getElementById("storeCancelPurchaseButton"),
  storeConfirmPurchaseButton: document.getElementById("storeConfirmPurchaseButton"),
  storeExitButton: document.getElementById("storeExitButton"),
  storePlayButton: document.getElementById("storePlayButton"),
  // startPngRenderingCheckbox: document.getElementById("startPngRenderingCheckbox"),
  mainMenuOverlay: document.getElementById("mainMenuOverlay"),
  mainMenuCloseButton: document.getElementById("mainMenuCloseButton"),
  mainMenuBackButton: document.getElementById("mainMenuBackButton"),
  privilegeBoard: document.getElementById("privilegeBoard"),
  menuDifficultySelect: document.getElementById("menuDifficultySelect"),
  menuShootingModeSelect: document.getElementById("menuShootingModeSelect"),
  menuLevelBlocks: document.getElementById("menuLevelBlocks"),
  menuTutorialBlocks: document.getElementById("menuTutorialBlocks"),
  levelTitle: document.getElementById("levelTitle"),
  levelSelect: document.getElementById("levelSelect"),
  tutorialSelect: document.getElementById("tutorialSelect"),
  tempLevelSelect: document.getElementById("tempLevelSelect"),
  operatorCountSelect: document.getElementById("operatorCountSelect"),
  modeLabel: document.getElementById("modeLabel"),
  objectiveLabel: document.getElementById("objectiveLabel"),
  selectedStatusLabel: document.getElementById("selectedStatusLabel"),
  shootingStatusLabel: document.getElementById("shootingStatusLabel"),
  selectedZoneLabel: document.getElementById("selectedZoneLabel"),
  runButton: document.getElementById("runButton"),
  restartButton: document.getElementById("restartButton"),
  debugButton: document.getElementById("debugButton"),
  settingsButton: document.getElementById("settingsButton"),
  weaponSelect: document.getElementById("weaponSelect"),
  armorSelect: document.getElementById("armorSelect"),
  backpackSelect: document.getElementById("backpackSelect"),
  weaponPixelPreview: document.getElementById("weaponPixelPreview"),
  selectedOperatorLabel: document.getElementById("selectedOperatorLabel"),
  settingsSelectedOperatorLabel: document.getElementById("settingsSelectedOperatorLabel"),
  ammoBoard: document.getElementById("ammoBoard"),
  weaponStats: document.getElementById("weaponStats"),
  inventorySummary: document.getElementById("inventorySummary"),
  inventoryButton: document.getElementById("inventoryButton"),
  operatorHealthBoard: document.getElementById("operatorHealthBoard"),
  showAllHealthButton: document.getElementById("showAllHealthButton"),
  hintText: document.getElementById("hintText"),
  settingsOverlay: document.getElementById("settingsOverlay"),
  settingsChangeOverlay: document.getElementById("settingsChangeOverlay"),
  confirmSettingsChangeButton: document.getElementById("confirmSettingsChangeButton"),
  cancelSettingsChangeButton: document.getElementById("cancelSettingsChangeButton"),
  closeSettingsButton: document.getElementById("closeSettingsButton"),
  resetSettingsButton: document.getElementById("resetSettingsButton"),
  settingsExitToMenuButton: document.getElementById("settingsExitToMenuButton"),
  settingsTabs: document.querySelectorAll("[data-settings-tab]"),
  settingsPanels: document.querySelectorAll("[data-settings-panel]"),
  difficultySelect: document.getElementById("difficultySelect"),
  shootingModeSelect: document.getElementById("shootingModeSelect"),
  enemyTraceSelect: document.getElementById("enemyTraceSelect"),
  hintOpacityRange: document.getElementById("hintOpacityRange"),
  hintOpacityValue: document.getElementById("hintOpacityValue"),
  viewRange: document.getElementById("viewRange"),
  viewValueLabel: document.getElementById("viewValueLabel"),
  storeScoreInput: document.getElementById("storeScoreInput"),
  confirmStoreScoreButton: document.getElementById("confirmStoreScoreButton"),
  // pixelArtStyleSelect: document.getElementById("pixelArtStyleSelect"),
  // pngRenderingCheckbox: document.getElementById("pngRenderingCheckbox"),
  keyBindingList: document.getElementById("keyBindingList"),
  enemyLoadoutList: document.getElementById("enemyLoadoutList"),
  digitalLockOverlay: document.getElementById("digitalLockOverlay"),
  digitalLockTitle: document.getElementById("digitalLockTitle"),
  digitalLockDisplay: document.getElementById("digitalLockDisplay"),
  digitalLockKeypad: document.getElementById("digitalLockKeypad"),
  digitalLockError: document.getElementById("digitalLockError"),
  unlockDigitalDoorButton: document.getElementById("unlockDigitalDoorButton"),
  cancelDigitalLockButton: document.getElementById("cancelDigitalLockButton"),
  inventoryOverlay: document.getElementById("inventoryOverlay"),
  inventoryTitle: document.getElementById("inventoryTitle"),
  inventoryDetails: document.getElementById("inventoryDetails"),
  closeInventoryButton: document.getElementById("closeInventoryButton"),
  equipmentTableOverlay: document.getElementById("equipmentTableOverlay"),
  equipmentTableTitle: document.getElementById("equipmentTableTitle"),
  equipmentTableOptions: document.getElementById("equipmentTableOptions"),
  closeEquipmentTableButton: document.getElementById("closeEquipmentTableButton"),
  laptopOverlay: document.getElementById("laptopOverlay"),
  laptopTitle: document.getElementById("laptopTitle"),
  closeLaptopButton: document.getElementById("closeLaptopButton"),
  startHackButton: document.getElementById("startHackButton"),
  cameraHackList: document.getElementById("cameraHackList"),
  tutorialCard: document.getElementById("tutorialCard"),
  hintCard: document.getElementById("hintCard"),
  tutorialTitle: document.getElementById("tutorialTitle"),
  tutorialText: document.getElementById("tutorialText"),
  tutorialProgress: document.getElementById("tutorialProgress"),
  pauseOverlay: document.getElementById("pauseOverlay"),
  pauseResumeButton: document.getElementById("pauseResumeButton"),
  pauseRestartButton: document.getElementById("pauseRestartButton"),
  pauseLevelButton: document.getElementById("pauseLevelButton"),
  pauseTutorialButton: document.getElementById("pauseTutorialButton"),
  pauseSettingButton: document.getElementById("pauseSettingButton"),
  expandGameButton: document.getElementById("expandGameButton"),
  expandedPauseButton: document.getElementById("expandedPauseButton"),
  expandedNav: document.getElementById("expandedNav"),
  mobileControls: document.getElementById("mobileControls"),
  mobilePauseButton: document.getElementById("mobilePauseButton"),
  mobileMoveJoystick: document.getElementById("mobileMoveJoystick"),
  mobileJoystickThumb: document.getElementById("mobileJoystickThumb"),
  mobileInteractButton: document.getElementById("mobileInteractButton"),
  mobileSwitchButton: document.getElementById("mobileSwitchButton"),
  banner: document.getElementById("banner"),
  bannerTitle: document.getElementById("bannerTitle"),
  bannerText: document.getElementById("bannerText"),
  missionReport: document.getElementById("missionReport"),
  resultLevelSelect: document.getElementById("resultLevelSelect"),
  nextLevelButton: document.getElementById("nextLevelButton"),
  exitTutorialButton: document.getElementById("exitTutorialButton"),
  exitToMenuButton: document.getElementById("exitToMenuButton"),
  bannerRestartButton: document.getElementById("bannerRestartButton")
};

const ctx = elements.canvas.getContext("2d");
const DEFAULT_WORLD = { w: 960, h: 640 };
const RESUME_STORAGE_KEY = "delta-geometry-resume";
const STORE_PROFILE_STORAGE_KEY = "delta-geometry-store-profile";
const WORLD = { ...DEFAULT_WORLD };
const TWO_PI = Math.PI * 2;
const UNIT_RADIUS = 12;
const DIFFICULT_OPERATOR_SIGHT = 115;
const MANUAL_ACTIONS = new Set(["moveUp", "moveDown", "moveLeft", "moveRight"]);

const colors = {
  floor: "#1a1f1f",
  floorAlt: "#202626",
  grid: "rgba(255,255,255,0.035)",
  wall: "#596369",
  wallEdge: "#2a3033",
  doorClosed: "#e0af56",
  doorOpen: "#70c58d",
  doorLocked: "#e25f5f",
  doorUnlocked: "#72b7ce",
  success: "#60c689",
  path: "#79c7dd",
  op: "#68c98f",
  opDark: "#173f2a",
  enemy: "#df6262",
  hostage: "#ebd36b",
  cyan: "#72b7ce",
  text: "#eef3ef",
  muted: "#9ca79f",
  sight: "rgba(226,95,95,0.13)",
  opSight: "rgba(103,201,143,0.12)",
  selected: "#ffffff"
};

const LEVEL_OPTIONS = [
  { id: "ridge-house-entry", title: "Ridge House Entry", file: "level/ridge-house-entry.json" },
  { id: "warehouse-pinch", title: "Warehouse Pinch", file: "level/warehouse-pinch.json" },
  { id: "hardpoint-gallery", title: "Hardpoint Gallery", file: "level/hardpoint-gallery.json" },
  { id: "terminal-breach", title: "Terminal Breach", file: "level/terminal-breach.json" },
  { id: "house-blueprint", title: "House Blueprint", file: "level/house-blueprint.json" },
  { id: "camera-house", title: "Camera House", file: "level/camera-house.json" },
  { id: "passage-boat-blueprint", title: "Passage Boat Blueprint", file: "level/passage-boat-blueprint.json" }
];

const TUTORIAL_OPTIONS = [
  { id: "tutorial-basics-movement", title: "Tutorial: Basics Movement", file: "tutorials/basics-movement.json" },
  { id: "tutorial-shooting-modes", title: "Tutorial: Shooting Modes", file: "tutorials/shooting-modes.json" },
  { id: "tutorial-operators-stairs", title: "Tutorial: Operators And Stairs", file: "tutorials/operators-stairs.json" },
  { id: "tutorial-equipment-table", title: "Tutorial: Equipment Table", file: "tutorials/equipment-table.json" },
  { id: "tutorial-windows", title: "Tutorial: Windows", file: "tutorials/windows.json" },
  { id: "tutorial-digital-lock", title: "Tutorial: Digital Lock", file: "tutorials/digital-lock.json" }
];

const TEMP_LEVEL_OPTIONS = [
  { id: "temp-ridge-scene-source", title: "Temp: Ridge Scene Source", file: "temp/ridge-house-entry-scene-source.json" }
];

const WEAPON_OPTIONS = [
  { id: "no-weapon", file: "equipment/no-weapon.json" },
  { id: "rifle", file: "equipment/rifle.json" },
  { id: "smg", file: "equipment/smg.json" },
  { id: "pistol", file: "equipment/pistol.json" },
  { id: "melee", file: "equipment/melee.json" },
  { id: "advanced-carbine", file: "equipment/advanced-carbine.json" },
  { id: "compact-pdw", file: "equipment/compact-pdw.json" },
  { id: "marksman-pistol", file: "equipment/marksman-pistol.json" }
];

const ARMOR_OPTIONS = [
  { id: "no-armor", file: "equipment/no-armor.json" },
  { id: "light-armor", file: "equipment/light-armor.json" },
  { id: "medium-armor", file: "equipment/medium-armor.json" },
  { id: "heavy-armor", file: "equipment/heavy-armor.json" }
];

const BACKPACK_OPTIONS = [
  { id: "no-backpack", file: "equipment/no-backpack.json" },
  { id: "small-backpack", file: "equipment/small-backpack.json" },
  { id: "medium-backpack", file: "equipment/medium-backpack.json" },
  { id: "large-backpack", file: "equipment/large-backpack.json" }
];

const STORE_CATALOG = [
  { id: "no-weapon", type: "weapon", name: "No Weapon", icon: "no-weapon", stats: { disabled: true } },
  { id: "rifle", type: "weapon", name: "Rifle", icon: "rifle", stats: { range: 245, damage: 18, magSize: 30, reserve: 120, fireInterval: 0.16 } },
  { id: "smg", type: "weapon", name: "SMG", icon: "smg", stats: { range: 190, damage: 12, magSize: 32, reserve: 160, fireInterval: 0.09 } },
  { id: "pistol", type: "weapon", name: "Pistol", icon: "pistol", stats: { range: 150, damage: 22, magSize: 12, reserve: 60, fireInterval: 0.36 } },
  { id: "melee", type: "weapon", name: "Melee", icon: "melee", stats: { range: 26, damage: 200, melee: true } },
  { id: "advanced-carbine", type: "weapon", name: "Advanced Carbine", icon: "advanced-carbine", stats: { range: 285, damage: 22, magSize: 34, reserve: 150, fireInterval: 0.13, reward: true } },
  { id: "compact-pdw", type: "weapon", name: "Compact PDW", icon: "compact-pdw", stats: { range: 215, damage: 15, magSize: 40, reserve: 200, fireInterval: 0.075, reward: true } },
  { id: "marksman-pistol", type: "weapon", name: "Marksman Pistol", icon: "marksman-pistol", stats: { range: 205, damage: 34, magSize: 10, reserve: 70, fireInterval: 0.32, reward: true } },
  { id: "no-armor", type: "armor", name: "No Armor", icon: "no-armor", stats: { armor: 0, speedMultiplier: 1 } },
  { id: "light-armor", type: "armor", name: "Light Armor", icon: "light-armor", stats: { armor: 25, speedMultiplier: 1 } },
  { id: "medium-armor", type: "armor", name: "Medium Armor", icon: "medium-armor", stats: { armor: 50, speedMultiplier: 0.94 } },
  { id: "heavy-armor", type: "armor", name: "Heavy Armor", icon: "heavy-armor", stats: { armor: 80, speedMultiplier: 0.88, reward: true } },
  { id: "no-backpack", type: "backpack", name: "No Backpack", icon: "no-backpack", stats: { slots: 1, speedMultiplier: 1, ammoMultiplier: 1 } },
  { id: "small-backpack", type: "backpack", name: "Small Backpack", icon: "small-backpack", stats: { slots: 2, speedMultiplier: 1.02 } },
  { id: "medium-backpack", type: "backpack", name: "Medium Backpack", icon: "medium-backpack", stats: { slots: 4, speedMultiplier: 1 } },
  { id: "large-backpack", type: "backpack", name: "Large Backpack", icon: "large-backpack", stats: { slots: 6, speedMultiplier: 0.96 } }
];

const SOUND_OPTIONS = [
  { id: "door-open", file: "sounds/door-open.wav" },
  { id: "door-locked", file: "sounds/door-locked.wav" },
  { id: "rifle-shot", file: "sounds/rifle-shot.wav" },
  { id: "smg-shot", file: "sounds/smg-shot.wav" },
  { id: "pistol-shot", file: "sounds/pistol-shot.wav" },
  { id: "operator-down", file: "sounds/operator-down.wav" },
  { id: "mission-success", file: "sounds/mission-success.wav" },
  { id: "mission-failed", file: "sounds/mission-failed.wav" },
  { id: "window-break", file: "sounds/window-break.wav" },
  { id: "operator-walk", file: "sounds/armed-cement-walk.wav" },
  { id: "enemy-walk", file: "sounds/enemy-walk.wav" },
  { id: "button-guidance", file: "sounds/button-guidance.wav" },
  { id: "store-select", file: "sounds/store-select.wav" },
  { id: "store-purchase", file: "sounds/store-purchase.wav" }
];

const MOBILE_OBJECT_SCALE_CONFIG = {
  baseWidth: 1920,
  baseHeight: 1080,
  minObjectScale: 0.65,
  scaleHitboxes: false
};

const runtime = {
  state: null,
  currentLevel: null,
  currentLevelMeta: null,
  activeOperatorCount: 2,
  currentDifficulty: "normal",
  settingsOpen: false,
  settingsResumeRunning: false,
  settingChangeOpen: false,
  pendingSettingChange: null,
  digitalLockOpen: false,
  digitalLockResumeRunning: false,
  inventoryOpen: false,
  inventoryResumeRunning: false,
  equipmentTableOpen: false,
  equipmentTableResumeRunning: false,
  laptopOpen: false,
  laptopResumeRunning: false,
  activeDigitalDoorId: null,
  enemyTraceMode: "current",
  pauseOpen: false,
  pauseResumeRunning: false,
  expandedGame: false,
  expandedPaused: false,
  mobileMode: false,
  gameDataReady: false,
  gameDataLoading: null,
  onboardingReturnToStore: false,
  storeSelectedItemId: null,
  storeConfirmItemId: null,
  hintOpacity: 0.42,
  viewValue: 50,
  pixelArtStyle: "geometry",
  showAllHealth: false,
  activeSettingsTab: "keys",
  capturingKeyAction: null,
  manualFireHeld: false,
  manualFirePoint: null,
  activeMode: "level",
  lastTime: performance.now()
};

const keysDown = new Set();
const weapons = new Map();
const armors = new Map();
const backpacks = new Map();
const operatorLoadouts = {};
const operatorArmorLoadouts = {};
const operatorBackpackLoadouts = {};
const enemyLoadouts = {};
const enemyArmorLoadouts = {};

let audio;
let keybindings;
let camera;
let geometry;
let shooting;
let inventory;
let interaction;
let cameraHack;
let tutorial;
let progression;
let menu;
let objectScale;
let mobileControls;
let equipment;
let level;
let visibility;
let settings;
let digitalLock;
let enemyBehavior;
let mission;
let renderer;
let input;
let actions;

// Returns the currently selected live-or-down operator from game state.
function selectedOperator() {
  const state = runtime.state;
  if (!state) return null;
  return state.level.operators.find((op) => op.id === state.selectedId);
}

// Changes the active operator selection when the target operator is usable.
function selectOperator(id) {
  const state = runtime.state;
  if (!state) return;
  const op = state.level.operators.find((item) => item.id === id && !item.down);
  if (!op) return;
  state.selectedId = op.id;
  updateHud();
}

// Cycles control to the next living operator.
function cycleOperator() {
  const state = runtime.state;
  if (!state) return;
  const live = state.level.operators.filter((op) => !op.down);
  if (!live.length) return;
  const index = Math.max(0, live.findIndex((op) => op.id === state.selectedId));
  state.selectedId = live[(index + 1) % live.length].id;
  updateHud();
}

// Checks whether any manual movement key is currently held.
function hasManualInput() {
  return [...MANUAL_ACTIONS].some((action) => keysDown.has(action));
}

// Toggles between planning and execute mode when gameplay is not blocked.
function toggleRun() {
  const state = runtime.state;
  if (!state) return;
  if (state.gameOver) return;
  if (settings.gameplayPausedByOverlay()) return;
  state.running = !state.running;
  state.message = state.running ? "Execute" : "Planning";
  updateHud();
}

// Applies the selected difficulty and updates the player-facing status.
function setDifficulty(value) {
  runtime.currentDifficulty = value === "difficult" ? "difficult" : "normal";
  if (runtime.currentDifficulty === "difficult") runtime.enemyTraceMode = "chase";
  if (runtime.state) {
    runtime.state.message = runtime.currentDifficulty === "difficult" ? "Difficult mode: short sight, chase/search enemies, random enemy gear" : "Normal visibility enabled";
  }
  updateHud();
}

// Builds the default persistent store profile and equipment ownership.
function defaultStoreProfile() {
  return {
    storeVersion: 2,
    name: "operator#1",
    id: String(Math.floor(10000000 + Math.random() * 90000000)),
    score: 5000,
    ownedItemIds: ["rifle", "light-armor", "no-backpack"],
    equippedDefaults: {
      weaponId: "rifle",
      armorId: "light-armor",
      backpackId: "no-backpack"
    }
  };
}

// Reads or creates the lightweight store profile shown before gameplay starts.
function storeProfile() {
  const fallback = defaultStoreProfile();
  try {
    const saved = JSON.parse(localStorage.getItem(STORE_PROFILE_STORAGE_KEY) || "null");
    if (!saved || typeof saved !== "object") {
      writeStoreProfile(fallback);
      return fallback;
    }
    const isCurrentVersion = saved.storeVersion === fallback.storeVersion;
    const savedScore = Number(saved.score);
    const merged = {
      ...fallback,
      ...(isCurrentVersion ? saved : {}),
      storeVersion: fallback.storeVersion,
      name: saved.name || fallback.name,
      id: saved.id || fallback.id,
      score: isCurrentVersion && Number.isFinite(savedScore) ? Math.max(0, Math.floor(savedScore)) : fallback.score,
      ownedItemIds: uniqueIds([...(fallback.ownedItemIds || []), ...((saved.ownedItemIds || []))]),
      equippedDefaults: {
        ...fallback.equippedDefaults,
        ...(isCurrentVersion ? (saved.equippedDefaults || {}) : {})
      }
    };
    writeStoreProfile(merged);
    return merged;
  } catch (error) {
    return fallback;
  }
}

// Persists the current Store profile when browser storage is available.
function writeStoreProfile(profile) {
  try {
    localStorage.setItem(STORE_PROFILE_STORAGE_KEY, JSON.stringify(profile));
  } catch (error) {
    // Store remains playable when localStorage is blocked.
  }
}

// Returns a duplicate-free list while preserving order.
function uniqueIds(ids) {
  return [...new Set((ids || []).filter(Boolean))];
}

// Finds Store metadata by ID.
function storeItemById(id) {
  return STORE_CATALOG.find((item) => item.id === id) || null;
}

// Generates equipment prices from lightweight store stats.
function storePrice(item) {
  if (!item || item.id === "no-weapon" || item.id === "no-armor" || item.id === "no-backpack") return 0;
  const stats = item.stats || {};
  let value = 0;
  if (item.type === "weapon") {
    if (stats.melee) value = stats.damage * 3 + stats.range * 2;
    else value = (stats.range || 0) * 1.4
      + (stats.damage || 0) * 16
      + (stats.magSize || 0) * 5
      + (stats.reserve || 0) * 0.6
      + (stats.fireInterval ? 180 / stats.fireInterval : 0);
  } else if (item.type === "armor") {
    value = (stats.armor || 0) * 14 + Math.max(0, 1 - (stats.speedMultiplier || 1)) * 600;
  } else if (item.type === "backpack") {
    value = (stats.slots || 0) * 140 + Math.max(0, 1 - (stats.speedMultiplier || 1)) * 350;
  }
  if (stats.reward) value *= 1.25;
  return Math.max(0, Math.round(value / 25) * 25);
}

// Builds compact Store detail text from static catalog metadata.
function storeItemSummary(item) {
  if (!item) return "Select equipment to inspect its silhouette, role, and current store state.";
  const stats = item.stats || {};
  if (item.type === "weapon") {
    if (stats.disabled) return "Training-safe empty weapon slot. Operators will not fire until another weapon is equipped.";
    if (stats.melee) return `Close-contact weapon. Damage ${stats.damage}, range ${stats.range}. No magazine or reserve ammo required.`;
    return `Range ${stats.range}. Damage ${stats.damage}. Magazine ${stats.magSize}. Reserve ${stats.reserve}. Fire interval ${stats.fireInterval}s.`;
  }
  if (item.type === "armor") {
    return `Armor ${stats.armor}. Mobility ${Math.round((stats.speedMultiplier || 1) * 100)}%.`;
  }
  if (item.type === "backpack") {
    return `Inventory slots ${stats.slots}. Ammo carry ${Math.round((stats.ammoMultiplier || 1) * 100)}%. Mobility ${Math.round((stats.speedMultiplier || 1) * 100)}%.`;
  }
  return "Equipment item.";
}

// Applies Store defaults to saved operator loadout maps for future level clones.
function syncStoreDefaultsToLoadouts() {
  const profile = storeProfile();
  const defaults = profile.equippedDefaults || {};
  for (const id of ["ALPHA", "BRAVO"]) {
    operatorLoadouts[id] = defaults.weaponId || "rifle";
    operatorArmorLoadouts[id] = defaults.armorId || "light-armor";
    operatorBackpackLoadouts[id] = defaults.backpackId || "no-backpack";
  }
}

// Returns the Store-owned defaults for systems that clone operators dynamically.
function storeLoadoutDefaults() {
  return storeProfile().equippedDefaults || { weaponId: "rifle", armorId: "light-armor", backpackId: "no-backpack" };
}

// Equips an owned Store item as the default for all future operators.
function equipStoreItem(profile, item) {
  if (!item) return profile;
  if (item.type === "weapon") profile.equippedDefaults.weaponId = item.id;
  if (item.type === "armor") profile.equippedDefaults.armorId = item.id;
  if (item.type === "backpack") profile.equippedDefaults.backpackId = item.id;
  writeStoreProfile(profile);
  syncStoreDefaultsToLoadouts();
  if (runtime.gameDataReady && runtime.state) applyStoreDefaultsToActiveOperators();
  return profile;
}

// Applies Store defaults to the currently loaded operators when equipment data exists.
function applyStoreDefaultsToActiveOperators() {
  if (!runtime.state || !equipment || !shooting) return;
  const defaults = storeLoadoutDefaults();
  const armor = equipment.armorById(defaults.armorId || "light-armor");
  const backpack = equipment.backpackById(defaults.backpackId || "no-backpack");
  for (const op of runtime.state.level.operators || []) {
    op.weaponId = equipment.validWeaponId(defaults.weaponId || "rifle");
    op.armorId = equipment.validArmorId(defaults.armorId || "light-armor");
    op.backpackId = equipment.validBackpackId(defaults.backpackId || "no-backpack");
    op.maxArmor = armor.armor;
    op.armor = Math.min(op.maxArmor, Math.max(op.armor || 0, op.maxArmor));
    op.inventory.slots = backpack.slots;
    op.inventory.items = Array.from({ length: backpack.slots }, (_, index) => (op.inventory.items || [])[index] || null);
    op.speed = (op.baseSpeed || 92) * armor.speedMultiplier * (backpack.speedMultiplier || 1);
    shooting.resetAmmo(op);
  }
  updateHud();
}

// Shows a short Store status line.
function setStoreMessage(message) {
  if (!elements.storeMessage) return;
  elements.storeMessage.textContent = message || "";
  elements.storeMessage.classList.toggle("hidden", !message);
}

// Closes the Store purchase confirmation selector.
function closeStoreConfirmation(options = {}) {
  runtime.storeConfirmItemId = null;
  if (options.clearSelection) runtime.storeSelectedItemId = null;
  if (elements.storeConfirmPopup) elements.storeConfirmPopup.classList.add("hidden");
  renderStorePage();
}

// Handles Store item selection and confirmation opening.
function selectStoreItem(itemId) {
  const item = storeItemById(itemId);
  if (!item) return;
  if (runtime.storeSelectedItemId === itemId) {
    openStoreConfirmation(itemId);
    return;
  }
  runtime.storeSelectedItemId = itemId;
  runtime.storeConfirmItemId = null;
  if (audio) {
    audio.unlock();
    audio.play("store-select");
  }
  setStoreMessage(`${item.name} selected`);
  renderStorePage();
}

// Opens the confirmation selector for the selected Store item.
function openStoreConfirmation(itemId) {
  const item = storeItemById(itemId);
  if (!item || !elements.storeConfirmPopup) return;
  runtime.storeConfirmItemId = itemId;
  if (elements.storeConfirmText) elements.storeConfirmText.textContent = `${item.name}`;
  elements.storeConfirmPopup.classList.remove("hidden");
}

// Purchases or equips the currently confirmed Store item.
function confirmStorePurchase() {
  const item = storeItemById(runtime.storeConfirmItemId || runtime.storeSelectedItemId);
  if (!item) return;
  const profile = storeProfile();
  const owned = profile.ownedItemIds.includes(item.id);
  const price = storePrice(item);
  if (!owned && profile.score < price) {
    setStoreMessage("Not enough score");
    if (audio) audio.play("store-select");
    renderStorePage();
    return;
  }
  if (!owned) {
    profile.score -= price;
    profile.ownedItemIds = uniqueIds([...(profile.ownedItemIds || []), item.id]);
  }
  equipStoreItem(profile, item);
  runtime.storeSelectedItemId = null;
  runtime.storeConfirmItemId = null;
  if (audio) audio.play("store-purchase");
  setStoreMessage(owned ? `${item.name} equipped` : `${item.name} owned`);
  renderStorePage();
}

// Updates Store score from Settings.
function setStoreScore(value) {
  const next = Number(value);
  if (!Number.isFinite(next) || next < 0) {
    setStoreMessage("Invalid score");
    return false;
  }
  const profile = storeProfile();
  profile.score = Math.floor(next);
  writeStoreProfile(profile);
  setStoreMessage(`Store score set to ${profile.score}`);
  renderStorePage();
  updateHud();
  return true;
}

// Renders the Store profile and catalog without loading equipment JSON.
function renderStorePage() {
  const profile = storeProfile();
  if (elements.storeProfileName) elements.storeProfileName.textContent = profile.name;
  if (elements.storeProfileId) elements.storeProfileId.textContent = profile.id;
  if (elements.storeScoreValue) elements.storeScoreValue.textContent = String(profile.score);
  if (elements.storeScoreInput) elements.storeScoreInput.value = String(profile.score);
  if (elements.storeProfileAvatar && window.StorePixelArt) {
    elements.storeProfileAvatar.innerHTML = window.StorePixelArt.render("operator-profile", { label: "Operator profile image" });
  }
  if (!elements.storeEquipmentGrid) return;
  const ownedIds = new Set(profile.ownedItemIds || []);
  const equipped = profile.equippedDefaults || {};
  elements.storeEquipmentGrid.innerHTML = STORE_CATALOG.map((item) => `
    <article class="store-item-card${runtime.storeSelectedItemId === item.id ? " selected" : ""}${ownedIds.has(item.id) ? " owned" : ""}${Object.values(equipped).includes(item.id) ? " equipped" : ""}" data-store-item-id="${item.id}">
      ${window.StorePixelArt ? window.StorePixelArt.render(item.icon || item.id, { label: `${item.name} ${item.type}` }) : ""}
      <div class="store-item-copy">
        <span>${titleCase(item.type)}</span>
        <strong>${item.name}</strong>
      </div>
      <div class="store-item-price">
        <span>${Object.values(equipped).includes(item.id) ? "Equipped" : "Price"}</span>
        <strong>${ownedIds.has(item.id) ? "Owned" : storePrice(item)}</strong>
      </div>
    </article>
  `).join("");
  if (elements.storeConfirmPopup) {
    elements.storeConfirmPopup.classList.toggle("hidden", !runtime.storeConfirmItemId);
  }
  if (elements.storeConfirmText && runtime.storeConfirmItemId) {
    const item = storeItemById(runtime.storeConfirmItemId);
    elements.storeConfirmText.textContent = item ? item.name : "Purchase item?";
  }
  // Store right-side detail panel disabled; selection remains visible on catalog cards.
  // renderStoreDetailPanel(profile);
}

// Renders the right-side selected equipment Store showcase.
function renderStoreDetailPanel(profile = storeProfile()) {
  if (!elements.storeDetailPanel) return;
  const item = storeItemById(runtime.storeSelectedItemId);
  if (!item) {
    elements.storeDetailPanel.innerHTML = `
      <div class="store-detail-empty">
        <p class="eyebrow">Equipment Detail</p>
        <h3>Select equipment</h3>
        <p>Click an item in the catalog to inspect its larger silhouette and store status.</p>
      </div>
    `;
    return;
  }
  const ownedIds = new Set(profile.ownedItemIds || []);
  const equipped = profile.equippedDefaults || {};
  const owned = ownedIds.has(item.id);
  const equippedNow = Object.values(equipped).includes(item.id);
  const stateLabel = equippedNow ? "Equipped" : owned ? "Owned" : `Price ${storePrice(item)}`;
  elements.storeDetailPanel.innerHTML = `
    <div class="store-detail-art">
      ${window.StorePixelArt ? window.StorePixelArt.render(item.icon || item.id, { label: `${item.name} detail silhouette`, size: "detail" }) : ""}
    </div>
    <div class="store-detail-copy">
      <p class="eyebrow">${titleCase(item.type)}</p>
      <h3>${item.name}</h3>
      <strong>${stateLabel}</strong>
      <p>${storeItemSummary(item)}</p>
      <span>Click selected item again to confirm purchase or equip.</span>
    </div>
  `;
}

// Saves the last playable destination for the start-menu Resume action.
function saveResumePoint(meta, mode) {
  if (!meta || !meta.id) return;
  const payload = {
    id: meta.id,
    mode: mode || runtime.activeMode || "level",
    title: meta.title || meta.id,
    status: "in-progress",
    savedAt: Date.now()
  };
  try {
    localStorage.setItem(RESUME_STORAGE_KEY, JSON.stringify(payload));
  } catch (error) {
    // Resume is helpful, but the game should still run when storage is blocked.
  }
}

// Clears finished or invalid Resume data.
function clearResumePoint() {
  try {
    localStorage.removeItem(RESUME_STORAGE_KEY);
  } catch (error) {
    // Storage may be blocked; the visible button still falls back to runtime state.
  }
}

// Reads the unfinished destination saved for Resume.
function readResumePoint() {
  try {
    const raw = localStorage.getItem(RESUME_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed.id !== "string") return null;
    if (parsed.status !== "in-progress") {
      clearResumePoint();
      return null;
    }
    const exists = [...LEVEL_OPTIONS, ...TUTORIAL_OPTIONS, ...TEMP_LEVEL_OPTIONS].some((option) => option.id === parsed.id);
    if (!exists) {
      clearResumePoint();
      return null;
    }
    return parsed;
  } catch (error) {
    clearResumePoint();
    return null;
  }
}

// Reports whether the start menu can resume active or saved gameplay.
function hasResumePoint() {
  return Boolean((runtime.state && !runtime.state.gameOver) || readResumePoint());
}

// Updates the adaptive Start/Resume button and clears transient start-menu text.
function refreshStartMenu() {
  if (elements.playMenuButton) {
    elements.playMenuButton.textContent = hasResumePoint() ? "Resume" : "Start";
  }
  if (elements.startExitMessage) {
    elements.startExitMessage.classList.add("hidden");
    elements.startExitMessage.textContent = "";
  }
}

// Starts or resumes gameplay from the start menu.
async function resumeFromStartMenu() {
  if (runtime.state && !runtime.state.gameOver) {
    if (menu) menu.enterGame();
    return true;
  }
  const point = readResumePoint();
  if (!point) return false;
  await ensureGameDataReady();
  await level.loadLevel(point.id);
  if (menu) menu.enterGame();
  return true;
}

// Attempts to close the current browser tab and shows a fallback when blocked.
function exitFromStartMenu() {
  if (elements.startExitMessage) {
    elements.startExitMessage.textContent = "Trying to close the tab...";
    elements.startExitMessage.classList.remove("hidden");
  }
  window.close();
  window.setTimeout(() => {
    if (!elements.startExitMessage) return;
    elements.startExitMessage.textContent = "Your browser blocked tab closing. Close this tab manually to exit.";
    elements.startExitMessage.classList.remove("hidden");
  }, 180);
}

// Advances gameplay simulation for one frame.
function update(dt) {
  const state = runtime.state;
  audio.update(dt);
  if (!state) return;
  if (settings.gameplayPausedByOverlay()) return;
  const manualInput = hasManualInput();
  if (state.gameOver) return;
  camera.update(dt);

  for (const op of state.level.operators) {
    const isManualOperator = op.id === state.selectedId && manualInput;
    if (isManualOperator || state.running) {
      actions.updateOperator(op, dt);
    }
  }
  for (const op of state.level.operators) actions.updateOperatorCombat(op, dt);
  if (state.shootingMode === "manual" && runtime.manualFireHeld && runtime.manualFirePoint) {
    shooting.manualFire(selectedOperator(), runtime.manualFirePoint);
  }
  for (const enemy of state.level.enemies) actions.updateEnemy(enemy, dt);

  mission.updateObjective();
  state.shots = state.shots
    .map((shot) => ({ ...shot, ttl: shot.ttl - dt }))
    .filter((shot) => shot.ttl > 0);
  mission.checkMissionEnd();
  updateHud();
}

// Refreshes labels, loadout controls, health cards, and mission status.
function updateHud() {
  const state = runtime.state;
  runtime.pixelArtStyle = "geometry";
  const style = "geometry";
  document.body.classList.toggle("pixel-style-geometry", style === "geometry");
  document.body.classList.toggle("pixel-style-v1", style === "v1");
  document.body.classList.toggle("pixel-style-v2", style === "v2");
  if (!state) {
    elements.modeLabel.textContent = "Loading";
    elements.objectiveLabel.textContent = "Loading";
    elements.selectedStatusLabel.textContent = "None";
    elements.shootingStatusLabel.textContent = "Automatic";
    elements.selectedZoneLabel.textContent = "Loading";
    elements.runButton.textContent = "Execute";
    if (equipment) {
      equipment.renderLoadoutPanel();
      equipment.renderHealthBoard();
      equipment.renderEnemyLoadouts();
    }
    if (elements.hintOpacityValue) elements.hintOpacityValue.textContent = `${Math.round(runtime.hintOpacity * 100)}%`;
    if (elements.viewValueLabel) elements.viewValueLabel.textContent = String(Math.round(runtime.viewValue));
    if (elements.storeScoreInput && document.activeElement !== elements.storeScoreInput) {
      elements.storeScoreInput.value = String(storeProfile().score);
    }
    return;
  }
  elements.modeLabel.textContent = runtime.digitalLockOpen ? "Digital Lock" : (runtime.settingsOpen ? "Settings" : (state.gameOver ? titleCase(state.result) : (hasManualInput() ? "Manual" : (state.running ? "Execute" : "Planning"))));
  if (state.level.objective.secured) {
    elements.objectiveLabel.textContent = "Secured";
  } else if (state.level.objective.harmed) {
    elements.objectiveLabel.textContent = "Compromised";
  } else {
    const activeEnemies = state.level.enemies.filter((enemy) => !enemy.down).length;
    elements.objectiveLabel.textContent = `${activeEnemies} hostiles`;
  }
  elements.runButton.textContent = state.running ? "Pause" : "Execute";
  elements.difficultySelect.value = runtime.currentDifficulty;
  elements.shootingModeSelect.value = state.shootingMode;
  elements.enemyTraceSelect.value = runtime.enemyTraceMode;
  const selected = selectedOperator();
  elements.selectedStatusLabel.textContent = selected ? selected.id : "None";
  elements.shootingStatusLabel.textContent = titleCase(state.shootingMode || "automatic");
  elements.selectedZoneLabel.textContent = selected ? (selected.zone || selected.floor || "Map") : "Map";
  equipment.renderLoadoutPanel();
  equipment.renderHealthBoard();
  equipment.renderEnemyLoadouts();
  inventory.renderSummary();
  if (elements.hintText) {
    const hint = selected && interaction ? interaction.nearestHint(selected) : "";
    elements.hintText.textContent = hint || "Move near doors, windows, stairs, papers, laptops, or tables.";
  }
  if (elements.hintCard) {
    elements.hintCard.style.setProperty("--hint-card-alpha", String(runtime.hintOpacity));
  }
  if (elements.hintOpacityRange && Number(elements.hintOpacityRange.value) !== runtime.hintOpacity) {
    elements.hintOpacityRange.value = String(runtime.hintOpacity);
  }
  if (elements.hintOpacityValue) {
    elements.hintOpacityValue.textContent = `${Math.round(runtime.hintOpacity * 100)}%`;
  }
  if (elements.viewRange && Number(elements.viewRange.value) !== runtime.viewValue) {
    elements.viewRange.value = String(runtime.viewValue);
  }
  if (elements.viewValueLabel) {
    elements.viewValueLabel.textContent = String(Math.round(runtime.viewValue));
  }
  if (elements.storeScoreInput && document.activeElement !== elements.storeScoreInput) {
    elements.storeScoreInput.value = String(storeProfile().score);
  }
  // if (elements.pixelArtStyleSelect && elements.pixelArtStyleSelect.value !== style) {
  //   elements.pixelArtStyleSelect.value = style;
  // }
  // if (elements.pngRenderingCheckbox && elements.pngRenderingCheckbox.checked !== (runtime.usePngRendering !== false)) {
  //   elements.pngRenderingCheckbox.checked = runtime.usePngRendering !== false;
  // }
  // if (elements.startPngRenderingCheckbox && elements.startPngRenderingCheckbox.checked !== (runtime.usePngRendering !== false)) {
  //   elements.startPngRenderingCheckbox.checked = runtime.usePngRendering !== false;
  // }
  if (runtime.inventoryOpen) inventory.renderInventory();
  if (runtime.laptopOpen && cameraHack) cameraHack.render();
  if (tutorial) tutorial.update();
}

// Converts result labels into display-friendly title case.
function titleCase(value) {
  return value ? value[0].toUpperCase() + value.slice(1) : "";
}

// Delegates all canvas rendering to the render system.
function draw() {
  renderer.draw();
}

// Runs the animation frame loop and caps large frame deltas.
function loop(now) {
  const dt = Math.min(0.05, (now - runtime.lastTime) / 1000);
  runtime.lastTime = now;
  update(dt);
  draw();
  requestAnimationFrame(loop);
}

// Fails boot early if a required system script did not load.
function assertSystem(name, system) {
  if (!system) {
    throw new Error(`${name} failed to load`);
  }
}

// Creates each system and wires shared runtime dependencies between them.
function initializeSystems() {
  assertSystem("Geometry system", window.GeometrySystem);
  assertSystem("Keybinding system", window.KeybindingSystem);
  assertSystem("Camera system", window.CameraSystem);
  assertSystem("Shooting system", window.ShootingSystem);
  assertSystem("Inventory system", window.InventorySystem);
  assertSystem("Interaction system", window.InteractionSystem);
  assertSystem("Camera hack system", window.CameraHackSystem);
  assertSystem("Tutorial system", window.TutorialSystem);
  assertSystem("Progression system", window.ProgressionSystem);
  assertSystem("Menu system", window.MenuSystem);
  assertSystem("Object scale system", window.ObjectScaleSystem);
  assertSystem("Mobile control system", window.MobileControlSystem);
  assertSystem("Audio system", window.AudioSystem);
  assertSystem("Equipment system", window.EquipmentSystem);
  assertSystem("Level system", window.LevelSystem);
  assertSystem("Visibility system", window.VisibilitySystem);
  assertSystem("Settings system", window.SettingsSystem);
  assertSystem("Digital lock system", window.DigitalLockSystem);
  assertSystem("Enemy behavior system", window.EnemyBehaviorSystem);
  assertSystem("Mission system", window.MissionSystem);
  assertSystem("Render system", window.RenderSystem);
  assertSystem("Input system", window.InputSystem);
  assertSystem("Action system", window.ActionSystem);

  audio = window.AudioSystem.create({
    soundOptions: SOUND_OPTIONS,
    volume: 0.55,
    loopVolume: 0.34
  });

  keybindings = window.KeybindingSystem.create({
    elements
  });

  camera = window.CameraSystem.create({
    canvas: elements.canvas,
    world: WORLD,
    defaultWorld: DEFAULT_WORLD,
    clamp: (value, min, max) => Math.max(min, Math.min(max, value)),
    selectedOperator
  });

  objectScale = window.ObjectScaleSystem.create({
    config: MOBILE_OBJECT_SCALE_CONFIG,
    camera,
    pointRectDistance: (point, rect) => {
      const closestX = Math.max(rect.x, Math.min(rect.x + rect.w, point.x));
      const closestY = Math.max(rect.y, Math.min(rect.y + rect.h, point.y));
      return Math.hypot(point.x - closestX, point.y - closestY);
    }
  });

  geometry = window.GeometrySystem.create({
    runtime,
    canvas: elements.canvas,
    twoPi: TWO_PI,
    camera,
    objectScale
  });

  progression = window.ProgressionSystem.create({
    runtime,
    elements
  });

  equipment = window.EquipmentSystem.create({
    runtime,
    weapons,
    armors,
    backpacks,
    operatorLoadouts,
    operatorArmorLoadouts,
    operatorBackpackLoadouts,
    enemyLoadouts,
    enemyArmorLoadouts,
    elements,
    weaponOptions: WEAPON_OPTIONS,
    armorOptions: ARMOR_OPTIONS,
    backpackOptions: BACKPACK_OPTIONS,
    selectedOperator,
    progression,
    shooting: {
      resetAmmo: (unit) => shooting && shooting.resetAmmo(unit)
    },
    updateHud
  });

  shooting = window.ShootingSystem.create({
    getState: () => runtime.state,
    geometry,
    equipment,
    audio,
    enemyBehavior: {
      noticeShot: (...args) => enemyBehavior && enemyBehavior.noticeShot(...args)
    },
    actions: {
      damageEnemy: (...args) => actions && actions.damageEnemy(...args)
    },
    updateHud
  });

  inventory = window.InventorySystem.create({
    runtime,
    elements,
    keysDown,
    equipment,
    shooting,
    selectedOperator,
    weaponOptions: WEAPON_OPTIONS,
    armorOptions: ARMOR_OPTIONS,
    backpackOptions: BACKPACK_OPTIONS,
    updateHud
  });

  visibility = window.VisibilitySystem.create({
    runtime,
    difficultOperatorSight: DIFFICULT_OPERATOR_SIGHT,
    equipment,
    geometry,
    cameraHack: {
      isRevealed: (obj) => cameraHack && cameraHack.isRevealed(obj)
    }
  });

  settings = window.SettingsSystem.create({
    runtime,
    elements,
    keysDown,
    keybindings,
    level: {
      restart: () => level && level.restart()
    },
    operatorLoadouts,
    operatorArmorLoadouts,
    operatorBackpackLoadouts,
    enemyLoadouts,
    enemyArmorLoadouts,
    camera,
    renderEnemyLoadouts: () => equipment.renderEnemyLoadouts(),
    updateHud
  });

  digitalLock = window.DigitalLockSystem.create({
    runtime,
    elements,
    keysDown,
    audio,
    updateHud
  });

  cameraHack = window.CameraHackSystem.create({
    runtime,
    elements,
    keysDown,
    updateHud
  });

  tutorial = window.TutorialSystem.create({
    runtime,
    elements,
    pointDistance: geometry.pointDistance,
    pointRectDistance: geometry.scaledPointRectDistance
  });

  level = window.LevelSystem.create({
    runtime,
    elements,
    world: WORLD,
    defaultWorld: DEFAULT_WORLD,
    unitRadius: UNIT_RADIUS,
    levelOptions: LEVEL_OPTIONS,
    tutorialOptions: TUTORIAL_OPTIONS,
    tempLevelOptions: TEMP_LEVEL_OPTIONS,
    resizeCanvas: () => {
      if (camera) camera.resizeCanvas();
      if (objectScale) objectScale.update();
    },
    equipment,
    shooting,
    operatorLoadouts,
    operatorArmorLoadouts,
    operatorBackpackLoadouts,
    storeLoadoutDefaults,
    progression,
    keysDown,
    saveResumePoint,
    updateHud
  });

  interaction = window.InteractionSystem.create({
    getState: () => runtime.state,
    selectedOperator,
    geometry,
    inventory,
    cameraHack,
    actions: {
      damageOperator: (...args) => actions && actions.damageOperator(...args)
    },
    enemyBehavior: {
      noticeDoor: (...args) => enemyBehavior && enemyBehavior.noticeDoor(...args)
    },
    audio,
    openDigitalLock: digitalLock.openDigitalLock,
    updateHud
  });

  enemyBehavior = window.EnemyBehaviorSystem.create({
    getState: () => runtime.state,
    weaponById: equipment.weaponById,
    pointDistance: geometry.pointDistance,
    angleTo: geometry.angleTo,
    hasLineOfSight: geometry.hasLineOfSight,
    inFieldOfView: geometry.inFieldOfView,
    collidesWithMap: geometry.collidesWithMap,
    rectCenter: geometry.rectCenter,
    clamp: geometry.clamp,
    enemyTraceMode: () => runtime.enemyTraceMode,
    audio
  });

  mission = window.MissionSystem.create({
    runtime,
    elements,
    geometry,
    objectScale,
    audio,
    levelOptions: LEVEL_OPTIONS,
    tutorialOptions: TUTORIAL_OPTIONS,
    tempLevelOptions: TEMP_LEVEL_OPTIONS,
    currentLevelIndex: () => level.currentLevelIndex(),
    currentTutorialIndex: () => level.currentTutorialIndex(),
    tutorial,
    progression,
    clearResumePoint,
    refreshStartMenu,
    menu: {
      showMain: () => menu && menu.showMain()
    },
    updateHud
  });

  actions = window.ActionSystem.create({
    getState: () => runtime.state,
    selectedOperator,
    hasManualInput,
    isActionDown: (action) => keysDown.has(action),
    pointDistance: geometry.pointDistance,
    angleTo: geometry.angleTo,
    collidesWithMap: geometry.collidesWithMap,
    hasLineOfSight: geometry.hasLineOfSight,
    inFieldOfView: geometry.inFieldOfView,
    pointRectDistance: geometry.scaledPointRectDistance,
    scaledRadius: geometry.scaledRadius,
    nearestClosedDoorToOperator: geometry.nearestClosedDoorToOperator,
    isLockedDigitalDoor: geometry.isLockedDigitalDoor,
    weaponById: equipment.weaponById,
    operatorSightRange: visibility.operatorSightRange,
    openDigitalLock: digitalLock.openDigitalLock,
    interaction,
    shooting,
    enemyBehavior,
    audio,
    updateHud,
    colors
  });

  renderer = window.RenderSystem.create({
    runtime,
    canvas: elements.canvas,
    ctx,
    world: WORLD,
    colors,
    twoPi: TWO_PI,
    camera,
    geometry,
    visibility,
    interaction,
    cameraHack,
    selectedOperator,
    hasManualInput
  });

  input = window.InputSystem.create({
    runtime,
    elements,
    keysDown,
    keybindings,
    geometry,
    camera,
    actions,
    interaction,
    shooting,
    inventory,
    equipment,
    level,
    settings,
    digitalLock,
    cameraHack,
    tutorial,
    audio,
    selectedOperator,
    selectOperator,
    cycleOperator,
    toggleRun,
    setDifficulty,
    hasResumePoint,
    refreshStartMenu,
    resumeFromStartMenu,
    exitFromStartMenu,
    selectStoreItem,
    closeStoreConfirmation,
    confirmStorePurchase,
    setStoreScore,
    ensureGameDataReady,
    updateHud,
    operatorLoadouts,
    inventoryIsOpen: () => runtime.inventoryOpen,
    equipmentTableIsOpen: () => runtime.equipmentTableOpen,
    laptopIsOpen: () => runtime.laptopOpen,
    menu: {
      openPause: () => menu && menu.openPause(),
      closePause: () => menu && menu.closePause(),
      togglePause: () => menu && menu.togglePause(),
      showStart: () => menu && menu.showStart(),
      showStore: () => menu && menu.showStore(),
      closeStore: () => menu && menu.closeStore(),
      isStoreOpen: () => menu && menu.isStoreOpen(),
      openOnboarding: (...args) => menu && menu.openOnboarding(...args),
      closeOnboarding: () => menu && menu.closeOnboarding(),
      showMain: () => menu && menu.showMain(),
      showLevelMenu: () => menu && menu.showLevelMenu(),
      showTutorialMenu: () => menu && menu.showTutorialMenu(),
      openSettingsFromPause: () => menu && menu.openSettingsFromPause(),
      enterGame: () => menu && menu.enterGame(),
      isMainOpen: () => menu && menu.isMainOpen(),
      closeMainOverlay: () => menu && menu.closeMainOverlay(),
      toggleExpanded: (...args) => menu && menu.toggleExpanded(...args)
    }
  });

  input.bindEvents();

  menu = window.MenuSystem.create({
    runtime,
    elements,
    keysDown,
    levelOptions: LEVEL_OPTIONS,
    tutorialOptions: TUTORIAL_OPTIONS,
    tempLevelOptions: TEMP_LEVEL_OPTIONS,
    level,
    settings,
    inventory,
    progression,
    resizeCanvas: () => {
      if (camera) camera.resizeCanvas();
      if (objectScale) objectScale.update();
    },
    hasResumePoint,
    refreshStartMenu,
    renderStorePage,
    setDifficulty,
    updateHud
  });

  mobileControls = window.MobileControlSystem.create({
    runtime,
    elements,
    keysDown,
    menu,
    shooting,
    interaction,
    objectScale,
    selectedOperator,
    cycleOperator,
    updateHud
  });
  mobileControls.bindEvents();
  camera.resizeCanvas();
  objectScale.update();
  window.addEventListener("resize", () => {
    camera.resizeCanvas();
    objectScale.update();
  });
}

window.__breachline = {
  getState: () => runtime.state,
  getWeapons: () => [...weapons.values()],
  getArmors: () => [...armors.values()],
  getObjectScale: () => objectScale ? objectScale.objectScale() : 1,
  restart: () => level.restart(),
  loadLevel: async (levelId) => {
    await ensureGameDataReady();
    return level.loadLevel(levelId);
  },
  loadTutorial: async (tutorialId) => {
    await ensureGameDataReady();
    return level.loadLevel(tutorialId);
  },
  loadNextLevel: async () => {
    await ensureGameDataReady();
    return level.loadNextLevel();
  },
  loadNextTutorial: async () => {
    await ensureGameDataReady();
    return level.loadNextTutorial();
  },
  loadFirstLevel: async () => {
    await ensureGameDataReady();
    return level.loadFirstLevel();
  },
  showMain: async () => {
    await ensureGameDataReady();
    return menu.showMain();
  },
  cycleOperator,
  toggleRun
};

// Lazily loads equipment and selectors only after the player chooses a route.
async function ensureGameDataReady() {
  if (runtime.gameDataReady) return true;
  if (runtime.gameDataLoading) return runtime.gameDataLoading;
  runtime.gameDataLoading = (async () => {
    level.populateLevelSelect();
    await equipment.loadEquipment();
    syncStoreDefaultsToLoadouts();
    runtime.gameDataReady = true;
    if (menu) menu.render();
    updateHud();
    return true;
  })();
  try {
    return await runtime.gameDataLoading;
  } catch (error) {
    runtime.gameDataReady = false;
    runtime.state = null;
    elements.levelTitle.textContent = "Load Failed";
    elements.bannerTitle.textContent = "Load Failed";
    elements.bannerText.textContent = error.message;
    elements.banner.classList.remove("hidden");
    updateHud();
    throw error;
  } finally {
    runtime.gameDataLoading = null;
  }
}

// Shows only the start menu at boot; gameplay data is loaded after user choice.
async function boot() {
  try {
    if (menu) menu.showStart();
    updateHud();
  } catch (error) {
    runtime.state = null;
    elements.levelTitle.textContent = "Load Failed";
    elements.bannerTitle.textContent = "Load Failed";
    elements.bannerText.textContent = error.message;
    elements.banner.classList.remove("hidden");
    updateHud();
  }
}

initializeSystems();
boot();
requestAnimationFrame(loop);
