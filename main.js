"use strict";

const elements = {
  canvas: document.getElementById("game"),
  levelTitle: document.getElementById("levelTitle"),
  levelSelect: document.getElementById("levelSelect"),
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
  settingsOverlay: document.getElementById("settingsOverlay"),
  closeSettingsButton: document.getElementById("closeSettingsButton"),
  difficultySelect: document.getElementById("difficultySelect"),
  shootingModeSelect: document.getElementById("shootingModeSelect"),
  enemyTraceSelect: document.getElementById("enemyTraceSelect"),
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
  banner: document.getElementById("banner"),
  bannerTitle: document.getElementById("bannerTitle"),
  bannerText: document.getElementById("bannerText"),
  nextLevelButton: document.getElementById("nextLevelButton"),
  bannerRestartButton: document.getElementById("bannerRestartButton")
};

const ctx = elements.canvas.getContext("2d");
const DEFAULT_WORLD = { w: 960, h: 640 };
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
  { id: "house-blueprint", title: "House Blueprint", file: "level/house-blueprint.json" }
];

const WEAPON_OPTIONS = [
  { id: "rifle", file: "equipment/rifle.json" },
  { id: "smg", file: "equipment/smg.json" },
  { id: "pistol", file: "equipment/pistol.json" }
];

const ARMOR_OPTIONS = [
  { id: "light-armor", file: "equipment/light-armor.json" },
  { id: "medium-armor", file: "equipment/medium-armor.json" },
  { id: "heavy-armor", file: "equipment/heavy-armor.json" }
];

const BACKPACK_OPTIONS = [
  { id: "small-backpack", file: "equipment/small-backpack.json" },
  { id: "medium-backpack", file: "equipment/medium-backpack.json" },
  { id: "large-backpack", file: "equipment/large-backpack.json" }
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
  { id: "enemy-walk", file: "sounds/enemy-walk.wav" }
];

const runtime = {
  state: null,
  currentLevel: null,
  currentLevelMeta: null,
  activeOperatorCount: 2,
  currentDifficulty: "normal",
  settingsOpen: false,
  settingsResumeRunning: false,
  digitalLockOpen: false,
  digitalLockResumeRunning: false,
  inventoryOpen: false,
  inventoryResumeRunning: false,
  equipmentTableOpen: false,
  equipmentTableResumeRunning: false,
  activeDigitalDoorId: null,
  enemyTraceMode: "current",
  showAllHealth: false,
  capturingKeyAction: null,
  manualFireHeld: false,
  manualFirePoint: null,
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
  if (runtime.state) {
    runtime.state.message = runtime.currentDifficulty === "difficult" ? "Difficult visibility enabled" : "Normal visibility enabled";
  }
  updateHud();
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
  if (runtime.inventoryOpen) inventory.renderInventory();
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

  geometry = window.GeometrySystem.create({
    runtime,
    canvas: elements.canvas,
    twoPi: TWO_PI,
    camera
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
    geometry
  });

  settings = window.SettingsSystem.create({
    runtime,
    elements,
    keysDown,
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

  level = window.LevelSystem.create({
    runtime,
    elements,
    world: WORLD,
    defaultWorld: DEFAULT_WORLD,
    unitRadius: UNIT_RADIUS,
    levelOptions: LEVEL_OPTIONS,
    equipment,
    shooting,
    operatorLoadouts,
    operatorArmorLoadouts,
    operatorBackpackLoadouts,
    keysDown,
    updateHud
  });

  interaction = window.InteractionSystem.create({
    getState: () => runtime.state,
    selectedOperator,
    geometry,
    inventory,
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
    audio,
    levelOptions: LEVEL_OPTIONS,
    currentLevelIndex: () => level.currentLevelIndex(),
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
    pointRectDistance: geometry.pointRectDistance,
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
    selectedOperator,
    hasManualInput
  });

  input = window.InputSystem.create({
    runtime,
    elements,
    keysDown,
    keybindings,
    geometry,
    actions,
    interaction,
    shooting,
    inventory,
    equipment,
    level,
    settings,
    digitalLock,
    audio,
    selectedOperator,
    selectOperator,
    toggleRun,
    setDifficulty,
    updateHud,
    operatorLoadouts,
    inventoryIsOpen: () => runtime.inventoryOpen,
    equipmentTableIsOpen: () => runtime.equipmentTableOpen
  });

  input.bindEvents();
}

window.__breachline = {
  getState: () => runtime.state,
  getWeapons: () => [...weapons.values()],
  getArmors: () => [...armors.values()],
  restart: () => level.restart(),
  loadLevel: (levelId) => level.loadLevel(levelId),
  loadNextLevel: () => level.loadNextLevel(),
  toggleRun
};

// Loads startup data and opens the first level.
async function boot() {
  level.populateLevelSelect();
  try {
    await equipment.loadEquipment();
    await level.loadLevel(LEVEL_OPTIONS[0].id);
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
