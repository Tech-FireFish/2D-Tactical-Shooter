"use strict";

const elements = {
  canvas: document.getElementById("game"),
  startMenuOverlay: document.getElementById("startMenuOverlay"),
  playMenuButton: document.getElementById("playMenuButton"),
  onboardingQuestion: document.getElementById("onboardingQuestion"),
  playedYesButton: document.getElementById("playedYesButton"),
  playedNoButton: document.getElementById("playedNoButton"),
  mainMenuOverlay: document.getElementById("mainMenuOverlay"),
  mainMenuCloseButton: document.getElementById("mainMenuCloseButton"),
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
  settingsTabs: document.querySelectorAll("[data-settings-tab]"),
  settingsPanels: document.querySelectorAll("[data-settings-panel]"),
  difficultySelect: document.getElementById("difficultySelect"),
  shootingModeSelect: document.getElementById("shootingModeSelect"),
  enemyTraceSelect: document.getElementById("enemyTraceSelect"),
  hintOpacityRange: document.getElementById("hintOpacityRange"),
  viewRange: document.getElementById("viewRange"),
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
  hintOpacity: 0.42,
  viewValue: 50,
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
  if (elements.viewRange && Number(elements.viewRange.value) !== runtime.viewValue) {
    elements.viewRange.value = String(runtime.viewValue);
  }
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
    progression,
    keysDown,
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
    updateHud,
    operatorLoadouts,
    inventoryIsOpen: () => runtime.inventoryOpen,
    equipmentTableIsOpen: () => runtime.equipmentTableOpen,
    laptopIsOpen: () => runtime.laptopOpen,
    menu: {
      openPause: () => menu && menu.openPause(),
      closePause: () => menu && menu.closePause(),
      togglePause: () => menu && menu.togglePause(),
      showMain: () => menu && menu.showMain(),
      showLevelMenu: () => menu && menu.showLevelMenu(),
      showTutorialMenu: () => menu && menu.showTutorialMenu(),
      openSettingsFromPause: () => menu && menu.openSettingsFromPause(),
      enterGame: () => menu && menu.enterGame(),
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
    setDifficulty,
    updateHud
  });
  menu.render();

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
  loadLevel: (levelId) => level.loadLevel(levelId),
  loadTutorial: (tutorialId) => level.loadLevel(tutorialId),
  loadNextLevel: () => level.loadNextLevel(),
  loadNextTutorial: () => level.loadNextTutorial(),
  loadFirstLevel: () => level.loadFirstLevel(),
  showMain: () => menu.showMain(),
  cycleOperator,
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
