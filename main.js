"use strict";

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const levelTitle = document.getElementById("levelTitle");
const levelSelect = document.getElementById("levelSelect");
const operatorCountSelect = document.getElementById("operatorCountSelect");
const modeLabel = document.getElementById("modeLabel");
const clockLabel = document.getElementById("clockLabel");
const objectiveLabel = document.getElementById("objectiveLabel");
const runButton = document.getElementById("runButton");
const restartButton = document.getElementById("restartButton");
const debugButton = document.getElementById("debugButton");
const settingsButton = document.getElementById("settingsButton");
const weaponSelect = document.getElementById("weaponSelect");
const armorSelect = document.getElementById("armorSelect");
const selectedOperatorLabel = document.getElementById("selectedOperatorLabel");
const weaponStats = document.getElementById("weaponStats");
const operatorHealthBoard = document.getElementById("operatorHealthBoard");
const settingsOverlay = document.getElementById("settingsOverlay");
const closeSettingsButton = document.getElementById("closeSettingsButton");
const difficultySelect = document.getElementById("difficultySelect");
const enemyLoadoutList = document.getElementById("enemyLoadoutList");
const digitalLockOverlay = document.getElementById("digitalLockOverlay");
const digitalLockTitle = document.getElementById("digitalLockTitle");
const digitalLockInput = document.getElementById("digitalLockInput");
const digitalLockError = document.getElementById("digitalLockError");
const unlockDigitalDoorButton = document.getElementById("unlockDigitalDoorButton");
const cancelDigitalLockButton = document.getElementById("cancelDigitalLockButton");
const banner = document.getElementById("banner");
const bannerTitle = document.getElementById("bannerTitle");
const bannerText = document.getElementById("bannerText");
const nextLevelButton = document.getElementById("nextLevelButton");
const bannerRestartButton = document.getElementById("bannerRestartButton");

const DEFAULT_WORLD = { w: 960, h: 640 };
const WORLD = { ...DEFAULT_WORLD };
const TWO_PI = Math.PI * 2;
const UNIT_RADIUS = 12;
const DIFFICULT_OPERATOR_SIGHT = 115;
const MANUAL_KEYS = new Set(["w", "a", "s", "d"]);

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

let state;
let currentLevel;
let currentLevelMeta;
let activeOperatorCount = 2;
let currentDifficulty = "normal";
let settingsOpen = false;
let settingsResumeRunning = false;
let digitalLockOpen = false;
let digitalLockResumeRunning = false;
let activeDigitalDoorId = null;
let lastTime = performance.now();
const keysDown = new Set();
const weapons = new Map();
const armors = new Map();
const operatorLoadouts = {};
const operatorArmorLoadouts = {};
const enemyLoadouts = {};
const enemyArmorLoadouts = {};
let lastHealthBoardHtml = "";
let lastEnemyLoadoutHtml = "";

const LEVEL_OPTIONS = [
  { id: "ridge-house-entry", title: "Ridge House Entry", file: "level/ridge-house-entry.json" },
  { id: "warehouse-pinch", title: "Warehouse Pinch", file: "level/warehouse-pinch.json" },
  { id: "hardpoint-gallery", title: "Hardpoint Gallery", file: "level/hardpoint-gallery.json" },
  { id: "terminal-breach", title: "Terminal Breach", file: "level/terminal-breach.json" }
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

function weaponById(id) {
  return weapons.get(id) || weapons.get("rifle");
}

function validWeaponId(id) {
  return weapons.has(id) ? id : "rifle";
}

function armorById(id) {
  return armors.get(id) || armors.get("light-armor");
}

function validArmorId(id) {
  return armors.has(id) ? id : "light-armor";
}

function currentLevelWeaponLoadouts() {
  const levelId = currentLevelMeta ? currentLevelMeta.id : "default";
  if (!enemyLoadouts[levelId]) enemyLoadouts[levelId] = {};
  return enemyLoadouts[levelId];
}

function currentLevelArmorLoadouts() {
  const levelId = currentLevelMeta ? currentLevelMeta.id : "default";
  if (!enemyArmorLoadouts[levelId]) enemyArmorLoadouts[levelId] = {};
  return enemyArmorLoadouts[levelId];
}

function weaponOptionsHtml(selectedId) {
  return WEAPON_OPTIONS.map((meta) => {
    const weapon = weapons.get(meta.id);
    if (!weapon) return "";
    const selected = weapon.id === selectedId ? " selected" : "";
    return `<option value="${weapon.id}"${selected}>${weapon.name}</option>`;
  }).join("");
}

function armorOptionsHtml(selectedId) {
  return ARMOR_OPTIONS.map((meta) => {
    const armor = armors.get(meta.id);
    if (!armor) return "";
    const selected = armor.id === selectedId ? " selected" : "";
    return `<option value="${armor.id}"${selected}>${armor.name}</option>`;
  }).join("");
}

async function loadEquipment() {
  weapons.clear();
  armors.clear();
  const loadedWeapons = await Promise.all(WEAPON_OPTIONS.map(async (meta) => {
    const response = await fetch(meta.file, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`Unable to load ${meta.file}: ${response.status}`);
    }
    return response.json();
  }));
  const loadedArmors = await Promise.all(ARMOR_OPTIONS.map(async (meta) => {
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

function populateEquipmentSelects() {
  weaponSelect.innerHTML = "";
  for (const meta of WEAPON_OPTIONS) {
    const weapon = weapons.get(meta.id);
    if (!weapon) continue;
    const option = document.createElement("option");
    option.value = weapon.id;
    option.textContent = weapon.name;
    weaponSelect.append(option);
  }
  armorSelect.innerHTML = "";
  for (const meta of ARMOR_OPTIONS) {
    const armor = armors.get(meta.id);
    if (!armor) continue;
    const option = document.createElement("option");
    option.value = armor.id;
    option.textContent = armor.name;
    armorSelect.append(option);
  }
}

function renderEnemyLoadouts() {
  if (!state) {
    if (lastEnemyLoadoutHtml) {
      enemyLoadoutList.innerHTML = "";
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
    enemyLoadoutList.innerHTML = html || "<p class=\"empty-note\">No enemies in this level.</p>";
    lastEnemyLoadoutHtml = html;
  }
}

function applyEnemyWeapon(enemyId, weaponId) {
  const selectedWeaponId = validWeaponId(weaponId);
  currentLevelWeaponLoadouts()[enemyId] = selectedWeaponId;
  if (!state) return;
  const enemy = state.level.enemies.find((item) => item.id === enemyId);
  if (!enemy) return;
  enemy.weaponId = selectedWeaponId;
  enemy.fireTimer = 0;
  enemy.reaction = 0;
  enemy.sightRange = Math.max(190, weaponById(selectedWeaponId).range);
  state.message = `${enemy.id} equipped ${weaponById(selectedWeaponId).name}`;
  updateHud();
}

function applyEnemyArmor(enemyId, armorId) {
  const selectedArmorId = validArmorId(armorId);
  currentLevelArmorLoadouts()[enemyId] = selectedArmorId;
  if (!state) return;
  const enemy = state.level.enemies.find((item) => item.id === enemyId);
  if (!enemy) return;
  const armor = armorById(selectedArmorId);
  enemy.armorId = selectedArmorId;
  enemy.maxArmor = armor.armor;
  enemy.armor = armor.armor;
  enemy.speed = (enemy.baseSpeed || 34) * armor.speedMultiplier;
  state.message = `${enemy.id} equipped ${armor.name}`;
  updateHud();
}

function applyOperatorArmor(op, armorId) {
  const selectedArmorId = validArmorId(armorId);
  const armor = armorById(selectedArmorId);
  op.armorId = selectedArmorId;
  op.maxArmor = armor.armor;
  op.armor = armor.armor;
  op.speed = (op.baseSpeed || 92) * armor.speedMultiplier;
  operatorArmorLoadouts[op.id] = selectedArmorId;
  state.message = `${op.id} equipped ${armor.name}`;
  updateHud();
}

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

function cloneLevel(level) {
  const maxOperators = Math.max(1, Math.min(activeOperatorCount, level.operators.length));
  const levelWeaponLoadouts = currentLevelWeaponLoadouts();
  const levelArmorLoadouts = currentLevelArmorLoadouts();
  return {
    id: level.id,
    title: level.title,
    width: level.width || DEFAULT_WORLD.w,
    height: level.height || DEFAULT_WORLD.h,
    floorZones: (level.floorZones || []).map((zone) => ({ ...zone })),
    walls: level.walls.map((wall) => ({ ...wall })),
    doors: level.doors.map((door) => ({
      ...door,
      password: door.lockType === "digital" ? (door.password || "0000") : door.password,
      locked: door.lockType === "digital" ? door.locked !== false : Boolean(door.locked)
    })),
    operators: level.operators.slice(0, maxOperators).map((op) => {
      const armorId = validArmorId(operatorArmorLoadouts[op.id] || op.armorId || "light-armor");
      const armor = armorById(armorId);
      const baseSpeed = op.speed || 92;
      return {
        ...op,
        radius: UNIT_RADIUS,
        health: 100,
        armorId,
        armor: armor.armor,
        maxArmor: armor.armor,
        baseSpeed,
        speed: baseSpeed * armor.speedMultiplier,
        weaponId: validWeaponId(operatorLoadouts[op.id] || op.weaponId || "rifle"),
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
      const weaponId = validWeaponId(levelWeaponLoadouts[enemy.id] || enemy.weaponId || "rifle");
      const armorId = validArmorId(levelArmorLoadouts[enemy.id] || enemy.armorId || "light-armor");
      const armor = armorById(armorId);
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
        sightRange: enemy.sightRange || Math.max(190, weaponById(weaponId).range),
        fov: Math.PI * 0.78,
        reaction: 0,
        targetId: null,
        down: false,
        patrolIndex: 0
      };
    }),
    objective: { ...level.objective }
  };
}

function restart() {
  if (!currentLevel) return;
  keysDown.clear();
  state = createGameState(currentLevel);
  resizeWorld(state.level.width, state.level.height);
  lastTime = performance.now();
  banner.classList.add("hidden");
  levelTitle.textContent = currentLevel.title || currentLevelMeta.title;
  updateHud();
}

function resizeWorld(width, height) {
  WORLD.w = width || DEFAULT_WORLD.w;
  WORLD.h = height || DEFAULT_WORLD.h;
  canvas.width = WORLD.w;
  canvas.height = WORLD.h;
  canvas.style.aspectRatio = `${WORLD.w} / ${WORLD.h}`;
}

function currentLevelIndex() {
  return Math.max(0, LEVEL_OPTIONS.findIndex((level) => level.id === currentLevelMeta.id));
}

function populateLevelSelect() {
  levelSelect.innerHTML = "";
  for (const level of LEVEL_OPTIONS) {
    const option = document.createElement("option");
    option.value = level.id;
    option.textContent = level.title;
    levelSelect.append(option);
  }
}

async function loadLevel(levelId) {
  const meta = LEVEL_OPTIONS.find((level) => level.id === levelId) || LEVEL_OPTIONS[0];
  currentLevelMeta = meta;
  levelSelect.value = meta.id;
  levelSelect.disabled = true;
  levelTitle.textContent = "Loading...";

  try {
    const response = await fetch(meta.file, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`Unable to load ${meta.file}: ${response.status}`);
    }
    currentLevel = await response.json();
    currentLevel.id = currentLevel.id || meta.id;
    currentLevel.title = currentLevel.title || meta.title;
    restart();
  } catch (error) {
    currentLevel = null;
    state = null;
    levelTitle.textContent = "Level Load Failed";
    bannerTitle.textContent = "Level Load Failed";
    bannerText.textContent = error.message;
    banner.classList.remove("hidden");
  } finally {
    levelSelect.disabled = false;
  }
}

function loadNextLevel() {
  if (!currentLevelMeta) return;
  const nextIndex = (currentLevelIndex() + 1) % LEVEL_OPTIONS.length;
  loadLevel(LEVEL_OPTIONS[nextIndex].id);
}

function toggleRun() {
  if (!state) return;
  if (state.gameOver) return;
  if (gameplayPausedByOverlay()) return;
  state.running = !state.running;
  state.message = state.running ? "Execute" : "Planning";
  updateHud();
}

function hasManualInput() {
  return [...MANUAL_KEYS].some((key) => keysDown.has(key));
}

function selectedOperator() {
  if (!state) return null;
  return state.level.operators.find((op) => op.id === state.selectedId);
}

function selectOperator(id) {
  if (!state) return;
  const op = state.level.operators.find((item) => item.id === id && !item.down);
  if (!op) return;
  state.selectedId = op.id;
  updateHud();
}

function renderLoadoutPanel() {
  if (!state) {
    weaponSelect.disabled = true;
    armorSelect.disabled = true;
    selectedOperatorLabel.textContent = "Selected Operator";
    weaponStats.textContent = "Loading...";
    return;
  }
  const op = selectedOperator();
  weaponSelect.disabled = !op || op.down || state.gameOver;
  armorSelect.disabled = !op || op.down || state.gameOver;
  selectedOperatorLabel.textContent = op ? `${op.id} Weapon` : "Selected Operator";

  if (!op) {
    weaponStats.textContent = "No operator selected.";
    return;
  }

  weaponSelect.value = validWeaponId(op.weaponId);
  armorSelect.value = validArmorId(op.armorId);
  const weapon = weaponById(op.weaponId);
  const armor = armorById(op.armorId);
  if (!weapon || !armor) {
    weaponStats.textContent = "Equipment data unavailable.";
    return;
  }

  weaponStats.innerHTML = `
    <div>${weapon.role}</div>
    <div class="weapon-stat-row"><span>Range</span><strong>${weapon.range}</strong></div>
    <div class="weapon-stat-row"><span>Damage</span><strong>${weapon.damage}</strong></div>
    <div class="weapon-stat-row"><span>Fire Rate</span><strong>${(1 / weapon.fireInterval).toFixed(1)}/s</strong></div>
    <div class="weapon-stat-row"><span>Armor</span><strong>${armor.armor}</strong></div>
    <div class="weapon-stat-row"><span>Mobility</span><strong>${Math.round(armor.speedMultiplier * 100)}%</strong></div>
  `;
}

function renderHealthBoard() {
  if (!state) {
    if (lastHealthBoardHtml) {
      operatorHealthBoard.innerHTML = "";
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
    operatorHealthBoard.innerHTML = html;
    lastHealthBoardHtml = html;
  }
}

function openSettings() {
  if (settingsOpen || digitalLockOpen) return;
  settingsResumeRunning = Boolean(state && state.running);
  if (state) state.running = false;
  keysDown.clear();
  settingsOpen = true;
  settingsOverlay.classList.remove("hidden");
  renderEnemyLoadouts();
  updateHud();
}

function closeSettings() {
  if (!settingsOpen) return;
  settingsOpen = false;
  settingsOverlay.classList.add("hidden");
  if (state && !state.gameOver && settingsResumeRunning) {
    state.running = true;
  }
  settingsResumeRunning = false;
  updateHud();
}

function toggleSettings() {
  if (settingsOpen) {
    closeSettings();
  } else {
    openSettings();
  }
}

function gameplayPausedByOverlay() {
  return settingsOpen || digitalLockOpen;
}

function openDigitalLock(door) {
  if (!state || !door || digitalLockOpen || settingsOpen) return;
  digitalLockResumeRunning = Boolean(state.running);
  state.running = false;
  keysDown.clear();
  activeDigitalDoorId = door.id;
  digitalLockTitle.textContent = `${door.id} Locked`;
  digitalLockInput.value = "";
  digitalLockError.textContent = "";
  digitalLockOpen = true;
  digitalLockOverlay.classList.remove("hidden");
  digitalLockInput.focus();
  updateHud();
}

function closeDigitalLock(restoreRunning = true) {
  if (!digitalLockOpen) return;
  digitalLockOpen = false;
  digitalLockOverlay.classList.add("hidden");
  activeDigitalDoorId = null;
  if (restoreRunning && state && !state.gameOver && digitalLockResumeRunning) {
    state.running = true;
  }
  digitalLockResumeRunning = false;
  updateHud();
}

function submitDigitalLock() {
  if (!state || !activeDigitalDoorId) return;
  const door = state.level.doors.find((item) => item.id === activeDigitalDoorId);
  if (!door) {
    closeDigitalLock(false);
    return;
  }
  if (digitalLockInput.value === (door.password || "0000")) {
    door.locked = false;
    door.state = "closed";
    state.message = `${door.id} unlocked`;
    closeDigitalLock();
  } else {
    digitalLockError.textContent = "Incorrect password";
    digitalLockInput.select();
  }
}

function operatorSightRange(op) {
  if (currentDifficulty === "difficult") return DIFFICULT_OPERATOR_SIGHT;
  return weaponById(op.weaponId).range;
}

function visibleToOperators(target) {
  if (currentDifficulty !== "difficult") return true;
  return state.level.operators.some((op) => {
    if (op.down) return false;
    return pointDistance(op, target) <= operatorSightRange(op)
      && hasLineOfSight(op, target, state.level);
  });
}

function objectiveVisible() {
  if (!state) return false;
  const obj = state.level.objective;
  return currentDifficulty !== "difficult" || obj.secured || obj.harmed || visibleToOperators(obj);
}

function getMouseWorld(event) {
  const rect = canvas.getBoundingClientRect();
  const sx = canvas.width / rect.width;
  const sy = canvas.height / rect.height;
  return {
    x: (event.clientX - rect.left) * sx,
    y: (event.clientY - rect.top) * sy
  };
}

function pointDistance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function normalizeAngle(angle) {
  let out = angle;
  while (out <= -Math.PI) out += TWO_PI;
  while (out > Math.PI) out -= TWO_PI;
  return out;
}

function angleTo(a, b) {
  return Math.atan2(b.y - a.y, b.x - a.x);
}

function circleRectCollides(circle, rect, padding = 0) {
  const closestX = clamp(circle.x, rect.x - padding, rect.x + rect.w + padding);
  const closestY = clamp(circle.y, rect.y - padding, rect.y + rect.h + padding);
  const dx = circle.x - closestX;
  const dy = circle.y - closestY;
  return dx * dx + dy * dy <= circle.radius * circle.radius;
}

function pointRectDistance(point, rect) {
  const closestX = clamp(point.x, rect.x, rect.x + rect.w);
  const closestY = clamp(point.y, rect.y, rect.y + rect.h);
  return Math.hypot(point.x - closestX, point.y - closestY);
}

function rectCenter(rect) {
  return { x: rect.x + rect.w / 2, y: rect.y + rect.h / 2 };
}

function doorBlocks(door) {
  return door.state === "closed";
}

function blockingRects(level) {
  return [
    ...level.walls,
    ...level.doors.filter(doorBlocks)
  ];
}

function collidesWithMap(level, circle) {
  return blockingRects(level).some((rect) => circleRectCollides(circle, rect));
}

function pointInRect(point, rect) {
  return point.x >= rect.x && point.x <= rect.x + rect.w && point.y >= rect.y && point.y <= rect.y + rect.h;
}

function segmentIntersectsRect(a, b, rect) {
  if (pointInRect(a, rect) || pointInRect(b, rect)) return true;
  const r1 = { x: rect.x, y: rect.y };
  const r2 = { x: rect.x + rect.w, y: rect.y };
  const r3 = { x: rect.x + rect.w, y: rect.y + rect.h };
  const r4 = { x: rect.x, y: rect.y + rect.h };
  return lineSegmentsIntersect(a, b, r1, r2)
    || lineSegmentsIntersect(a, b, r2, r3)
    || lineSegmentsIntersect(a, b, r3, r4)
    || lineSegmentsIntersect(a, b, r4, r1);
}

function lineSegmentsIntersect(a, b, c, d) {
  const det = (b.x - a.x) * (d.y - c.y) - (b.y - a.y) * (d.x - c.x);
  if (Math.abs(det) < 0.0001) return false;
  const lambda = ((d.y - c.y) * (d.x - a.x) + (c.x - d.x) * (d.y - a.y)) / det;
  const gamma = ((a.y - b.y) * (d.x - a.x) + (b.x - a.x) * (d.y - a.y)) / det;
  return lambda >= 0 && lambda <= 1 && gamma >= 0 && gamma <= 1;
}

function hasLineOfSight(a, b, level) {
  const blockers = [
    ...level.walls,
    ...level.doors.filter(doorBlocks)
  ];
  return !blockers.some((rect) => segmentIntersectsRect(a, b, rect));
}

function inFieldOfView(observer, target) {
  const distance = pointDistance(observer, target);
  if (distance > observer.sightRange) return false;
  const delta = Math.abs(normalizeAngle(angleTo(observer, target) - observer.angle));
  return delta <= observer.fov / 2;
}

function nearestClosedDoorOnRoute(op, next) {
  let best = null;
  let bestDist = Infinity;
  for (const door of state.level.doors) {
    if (!doorBlocks(door)) continue;
    const crossing = segmentIntersectsRect({ x: op.x, y: op.y }, next, inflateRect(door, 8));
    const distance = pointRectDistance(op, door);
    const close = distance < 38;
    if ((crossing || close) && close && distance < bestDist) {
      best = door;
      bestDist = distance;
    }
  }
  return best;
}

function nearestClosedDoorToOperator(op, maxDistance = 52) {
  let best = null;
  let bestDist = Infinity;
  for (const door of state.level.doors) {
    if (!doorBlocks(door)) continue;
    const distance = pointRectDistance(op, door);
    if (distance < maxDistance && distance < bestDist) {
      best = door;
      bestDist = distance;
    }
  }
  return best;
}

function doorAtPoint(point) {
  return state.level.doors.find((door) => doorBlocks(door) && pointInRect(point, inflateRect(door, 6)));
}

function inflateRect(rect, amount) {
  return {
    x: rect.x - amount,
    y: rect.y - amount,
    w: rect.w + amount * 2,
    h: rect.h + amount * 2
  };
}

function isDigitalLockDoor(door) {
  return door && door.lockType === "digital";
}

function isLockedDigitalDoor(door) {
  return isDigitalLockDoor(door) && door.locked !== false;
}

function interactWithDoor(op, door) {
  if (!door || !op || op.down) return false;
  if (isLockedDigitalDoor(door)) {
    openDigitalLock(door);
    state.message = `${door.id} locked`;
    updateHud();
    return true;
  }
  door.state = "open";
  op.action = null;
  state.message = `${op.id} opened ${door.id}`;
  updateHud();
  return true;
}

function openNearestDoor() {
  if (!state || state.gameOver) return;
  const op = selectedOperator();
  if (!op || op.down) return;
  const door = nearestClosedDoorToOperator(op);
  if (!door) {
    state.message = "No door in reach";
    return;
  }
  interactWithDoor(op, door);
}

function openDoorByClick(door) {
  const op = selectedOperator();
  if (!op || op.down) return false;
  if (pointRectDistance(op, door) > 52) {
    state.message = "Move closer to the door";
    updateHud();
    return true;
  }
  return interactWithDoor(op, door);
}

function updateOperator(op, dt) {
  if (op.down) return;
  if (op.action) {
    op.action.timer -= dt;
    if (op.action.timer <= 0) {
      const door = state.level.doors.find((item) => item.id === op.action.doorId);
      if (door) door.state = "breached";
      op.action = null;
    }
    return;
  }

  if (op.id === state.selectedId && hasManualInput()) {
    updateManualOperator(op, dt);
    return;
  }

  const target = op.path[0];
  if (!target) return;

  const dist = pointDistance(op, target);
  if (dist < 4) {
    op.path.shift();
    return;
  }

  const direction = angleTo(op, target);
  op.aim = direction;
  const step = Math.min(dist, op.speed * dt);
  const next = {
    x: op.x + Math.cos(direction) * step,
    y: op.y + Math.sin(direction) * step,
    radius: op.radius
  };

  if (!collidesWithMap(state.level, next)) {
    op.x = next.x;
    op.y = next.y;
  }
}

function updateManualOperator(op, dt) {
  let dx = 0;
  let dy = 0;
  if (keysDown.has("w")) dy -= 1;
  if (keysDown.has("s")) dy += 1;
  if (keysDown.has("a")) dx -= 1;
  if (keysDown.has("d")) dx += 1;
  if (dx === 0 && dy === 0) return;

  const length = Math.hypot(dx, dy);
  dx /= length;
  dy /= length;
  op.path = [];
  op.aim = Math.atan2(dy, dx);

  const next = {
    x: op.x + dx * op.speed * dt,
    y: op.y + dy * op.speed * dt,
    radius: op.radius
  };

  if (!collidesWithMap(state.level, next)) {
    op.x = next.x;
    op.y = next.y;
  }
}

function updateEnemy(enemy, dt) {
  if (enemy.down) return;

  const weapon = weaponById(enemy.weaponId);
  const liveOps = state.level.operators.filter((op) => !op.down);
  const seen = liveOps
    .filter((op) => pointDistance(enemy, op) <= weapon.range)
    .find((op) => inFieldOfView(enemy, op) && hasLineOfSight(enemy, op, state.level));
  if (seen) {
    enemy.angle = angleTo(enemy, seen);
    fireAutomatic(enemy, seen, weapon, dt, damageOperator, colors.enemy);
    return;
  }

  enemy.targetId = null;
  enemy.reaction = Math.max(0, enemy.reaction - dt * 0.8);
  enemy.fireTimer = Math.max(0, enemy.fireTimer - dt);
  if (enemy.watch) {
    enemy.angle = angleTo(enemy, enemy.watch);
    return;
  }
  updateEnemyPatrol(enemy, dt);
}

function updateEnemyPatrol(enemy, dt) {
  if (!enemy.patrol || enemy.patrol.length < 2) return;
  const target = enemy.patrol[enemy.patrolIndex];
  const dist = pointDistance(enemy, target);
  if (dist < 5) {
    enemy.patrolIndex = (enemy.patrolIndex + 1) % enemy.patrol.length;
    return;
  }
  const direction = angleTo(enemy, target);
  enemy.angle = direction;
  const next = {
    x: enemy.x + Math.cos(direction) * enemy.speed * dt,
    y: enemy.y + Math.sin(direction) * enemy.speed * dt,
    radius: enemy.radius
  };
  if (!collidesWithMap(state.level, next)) {
    enemy.x = next.x;
    enemy.y = next.y;
  }
}

function updateOperatorCombat(op, dt) {
  if (op.down) return;
  const weapon = weaponById(op.weaponId);
  const visible = state.level.enemies
    .filter((enemy) => !enemy.down)
    .filter((enemy) => pointDistance(op, enemy) <= Math.min(weapon.range, operatorSightRange(op)))
    .filter((enemy) => hasLineOfSight(op, enemy, state.level))
    .sort((a, b) => pointDistance(op, a) - pointDistance(op, b));

  const target = visible[0];
  if (!target) {
    op.targetId = null;
    op.reaction = Math.max(0, op.reaction - dt * 0.9);
    op.fireTimer = Math.max(0, op.fireTimer - dt);
    return;
  }

  op.aim = angleTo(op, target);
  fireAutomatic(op, target, weapon, dt, damageEnemy, op.color);
}

function fireAutomatic(shooter, target, weapon, dt, damageTarget, color) {
  if (shooter.targetId !== target.id) {
    shooter.targetId = target.id;
    shooter.reaction = 0;
    shooter.fireTimer = 0;
  }

  shooter.reaction += dt;
  shooter.fireTimer = Math.max(0, shooter.fireTimer - dt);
  if (shooter.reaction < weapon.reactionDelay || shooter.fireTimer > 0) {
    return;
  }

  damageTarget(target, weapon.damage);
  addShot(shooter, target, color, weapon.tracerTtl);
  shooter.fireTimer = weapon.fireInterval;
}

function damageEnemy(enemy, amount) {
  applyDamage(enemy, amount);
  if (enemy.health <= 0) {
    enemy.health = 0;
    enemy.down = true;
    enemy.targetId = null;
    enemy.fireTimer = 0;
  }
}

function damageOperator(op, amount) {
  applyDamage(op, amount);
  if (op.health <= 0) {
    op.health = 0;
    op.down = true;
    op.path = [];
    op.action = null;
    op.fireTimer = 0;
  }
}

function applyDamage(unit, amount) {
  let remaining = amount;
  if (unit.armor > 0) {
    const absorbed = Math.min(unit.armor, remaining);
    unit.armor -= absorbed;
    remaining -= absorbed;
  }
  if (remaining > 0) {
    unit.health -= remaining;
  }
}

function addShot(from, to, color, ttl = 0.09) {
  state.shots.push({
    from: { x: from.x, y: from.y },
    to: { x: to.x, y: to.y },
    color,
    ttl
  });
}

function updateObjective() {
  const obj = state.level.objective;
  if (obj.secured || obj.harmed) return;

  const opNear = state.level.operators.some((op) => !op.down && pointDistance(op, obj) < 34);
  if (opNear) {
    obj.secured = true;
  }
}

function checkMissionEnd() {
  if (state.gameOver) return;
  const liveOps = state.level.operators.some((op) => !op.down);
  const allEnemiesDown = state.level.enemies.every((enemy) => enemy.down);
  if (state.level.objective.secured || allEnemiesDown) {
    finishMission("success", "Mission Complete", "Objective secured. The route held together.");
  } else if (!liveOps || state.level.objective.harmed) {
    finishMission("failure", "Mission Failed", "Restart and adjust the entry plan.");
  }
}

function finishMission(result, title, text) {
  state.gameOver = true;
  state.running = false;
  state.result = result;
  const nextIndex = (currentLevelIndex() + 1) % LEVEL_OPTIONS.length;
  const nextLevel = LEVEL_OPTIONS[nextIndex];
  bannerTitle.textContent = title;
  bannerText.textContent = `${text} Continue to ${nextLevel.title} or restart this level.`;
  nextLevelButton.textContent = nextIndex === 0 ? "First Level" : "Next Level";
  banner.classList.remove("hidden");
  updateHud();
}

function update(dt) {
  if (!state) return;
  if (gameplayPausedByOverlay()) return;
  const manualInput = hasManualInput();
  if (state.gameOver) return;

  for (const op of state.level.operators) {
    const isManualOperator = op.id === state.selectedId && manualInput;
    if (isManualOperator || state.running) {
      updateOperator(op, dt);
    }
  }
  for (const op of state.level.operators) updateOperatorCombat(op, dt);
  for (const enemy of state.level.enemies) updateEnemy(enemy, dt);

  updateObjective();
  state.shots = state.shots
    .map((shot) => ({ ...shot, ttl: shot.ttl - dt }))
    .filter((shot) => shot.ttl > 0);
  checkMissionEnd();
  updateHud();
}

function updateHud() {
  if (!state) {
    modeLabel.textContent = "Loading";
    clockLabel.textContent = "Off";
    objectiveLabel.textContent = "Loading";
    runButton.textContent = "Execute";
    renderLoadoutPanel();
    renderHealthBoard();
    renderEnemyLoadouts();
    return;
  }
  modeLabel.textContent = digitalLockOpen ? "Digital Lock" : (settingsOpen ? "Settings" : (state.gameOver ? titleCase(state.result) : (hasManualInput() ? "Manual" : (state.running ? "Execute" : "Planning"))));
  clockLabel.textContent = "Off";
  if (state.level.objective.secured) {
    objectiveLabel.textContent = "Secured";
  } else if (state.level.objective.harmed) {
    objectiveLabel.textContent = "Compromised";
  } else {
    const activeEnemies = state.level.enemies.filter((enemy) => !enemy.down).length;
    objectiveLabel.textContent = `${activeEnemies} hostiles`;
  }
  runButton.textContent = state.running ? "Pause" : "Execute";
  difficultySelect.value = currentDifficulty;
  renderLoadoutPanel();
  renderHealthBoard();
  renderEnemyLoadouts();
}

function titleCase(value) {
  return value ? value[0].toUpperCase() + value.slice(1) : "";
}

function draw() {
  ctx.clearRect(0, 0, WORLD.w, WORLD.h);
  if (!state) {
    drawLoading();
    return;
  }
  drawFloor();
  drawRooms();
  drawPaths();
  drawSight();
  drawDoors();
  drawObjective();
  drawUnits();
  drawShots();
  drawHudOverlay();
  if (state.debug) drawDebug();
}

function drawLoading() {
  ctx.fillStyle = colors.floor;
  ctx.fillRect(0, 0, WORLD.w, WORLD.h);
  ctx.fillStyle = colors.text;
  ctx.font = "800 24px system-ui";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("Loading level...", WORLD.w / 2, WORLD.h / 2);
}

function drawFloor() {
  ctx.fillStyle = colors.floor;
  ctx.fillRect(0, 0, WORLD.w, WORLD.h);
  ctx.strokeStyle = colors.grid;
  ctx.lineWidth = 1;
  for (let x = 20; x < WORLD.w; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, 20);
    ctx.lineTo(x, WORLD.h - 20);
    ctx.stroke();
  }
  for (let y = 20; y < WORLD.h; y += 40) {
    ctx.beginPath();
    ctx.moveTo(20, y);
    ctx.lineTo(WORLD.w - 20, y);
    ctx.stroke();
  }

  ctx.fillStyle = colors.floorAlt;
  const zones = state.level.floorZones.length ? state.level.floorZones : [
    { x: 140, y: 110, w: 155, h: 230 },
    { x: 315, y: 110, w: 185, h: 140 },
    { x: 520, y: 110, w: 270, h: 140 },
    { x: 315, y: 270, w: 185, h: 110 },
    { x: 520, y: 270, w: 130, h: 110 },
    { x: 670, y: 270, w: 120, h: 110 },
    { x: 140, y: 360, w: 155, h: 150 },
    { x: 315, y: 400, w: 185, h: 110 },
    { x: 520, y: 400, w: 270, h: 110 }
  ];
  for (const zone of zones) {
    ctx.fillRect(zone.x, zone.y, zone.w, zone.h);
  }
}

function drawRooms() {
  for (const wall of state.level.walls) {
    ctx.fillStyle = colors.wall;
    ctx.fillRect(wall.x, wall.y, wall.w, wall.h);
    ctx.strokeStyle = colors.wallEdge;
    ctx.lineWidth = 2;
    ctx.strokeRect(wall.x, wall.y, wall.w, wall.h);
  }
}

function drawDoors() {
  for (const door of state.level.doors) {
    const center = rectCenter(door);
    ctx.save();
    ctx.translate(center.x, center.y);
    ctx.rotate(door.orientation === "vertical" ? Math.PI / 2 : 0);
    ctx.fillStyle = door.state === "closed" ? colors.doorClosed : colors.doorOpen;
    if (door.state === "closed") {
      ctx.fillRect(-doorLong(door) / 2, -4, doorLong(door), 8);
    } else {
      ctx.rotate(-0.72);
      ctx.fillRect(-doorLong(door) / 2, -4, doorLong(door), 8);
    }
    ctx.restore();
    drawDoorIndicator(door, center);
  }
}

function drawDoorIndicator(door, center) {
  if (!isDigitalLockDoor(door) || door.state !== "closed") return;
  const locked = isLockedDigitalDoor(door);
  ctx.save();
  ctx.fillStyle = locked ? colors.doorLocked : colors.doorUnlocked;
  ctx.strokeStyle = "rgba(0,0,0,0.65)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(center.x, center.y, 9, 0, TWO_PI);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#101214";
  ctx.font = "900 10px system-ui";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(locked ? "L" : "U", center.x, center.y + 0.5);
  ctx.restore();
}

function doorLong(door) {
  return Math.max(door.w, door.h);
}

function drawPaths() {
  for (const op of state.level.operators) {
    if (!op.path.length) continue;
    ctx.strokeStyle = op.id === state.selectedId ? colors.selected : op.color;
    ctx.lineWidth = op.id === state.selectedId ? 3 : 2;
    ctx.setLineDash([8, 8]);
    ctx.beginPath();
    ctx.moveTo(op.x, op.y);
    for (const point of op.path) ctx.lineTo(point.x, point.y);
    ctx.stroke();
    ctx.setLineDash([]);
    for (const point of op.path) {
      ctx.fillStyle = op.color;
      ctx.beginPath();
      ctx.arc(point.x, point.y, 4, 0, TWO_PI);
      ctx.fill();
    }
  }
}

function drawSight() {
  for (const enemy of state.level.enemies) {
    if (enemy.down) continue;
    if (currentDifficulty === "difficult" && !visibleToOperators(enemy)) continue;
    drawCone(enemy, enemy.angle, enemy.sightRange, enemy.fov, colors.sight);
  }

  for (const op of state.level.operators) {
    if (op.down) continue;
    drawCone(op, op.aim, operatorSightRange(op), Math.PI * 0.52, colors.opSight);
  }
}

function drawCone(origin, angle, length, fov, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.moveTo(origin.x, origin.y);
  ctx.arc(origin.x, origin.y, length, angle - fov / 2, angle + fov / 2);
  ctx.closePath();
  ctx.fill();
}

function drawObjective() {
  if (!objectiveVisible()) return;
  const obj = state.level.objective;
  ctx.fillStyle = obj.harmed ? colors.enemy : colors.hostage;
  ctx.strokeStyle = obj.secured ? colors.success : "#5d5330";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(obj.x, obj.y, obj.radius, 0, TWO_PI);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#171b1e";
  ctx.font = "700 11px system-ui";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("VIP", obj.x, obj.y + 1);
}

function drawUnits() {
  for (const enemy of state.level.enemies) {
    if (currentDifficulty === "difficult" && !visibleToOperators(enemy)) continue;
    drawUnit(enemy, enemy.down ? "#573030" : colors.enemy, enemy.id, false);
  }
  for (const op of state.level.operators) drawUnit(op, op.down ? "#2d4035" : op.color, op.id, true);
}

function drawUnit(unit, fill, label, isOperator) {
  ctx.save();
  ctx.translate(unit.x, unit.y);
  ctx.rotate(isOperator ? unit.aim : unit.angle);
  ctx.fillStyle = fill;
  ctx.strokeStyle = unit.id === state.selectedId ? colors.selected : "#111";
  ctx.lineWidth = unit.id === state.selectedId ? 3 : 2;
  ctx.beginPath();
  ctx.arc(0, 0, unit.radius, 0, TWO_PI);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = isOperator ? colors.opDark : "#421d1d";
  ctx.beginPath();
  ctx.moveTo(unit.radius + 8, 0);
  ctx.lineTo(3, -5);
  ctx.lineTo(3, 5);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  ctx.fillStyle = colors.text;
  ctx.font = "800 10px system-ui";
  ctx.textAlign = "center";
  ctx.fillText(label, unit.x, unit.y - unit.radius - 8);
}

function drawShots() {
  for (const shot of state.shots) {
    ctx.strokeStyle = shot.color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(shot.from.x, shot.from.y);
    ctx.lineTo(shot.to.x, shot.to.y);
    ctx.stroke();
  }
}

function drawHudOverlay() {
  const selected = selectedOperator();
  const nearDoor = selected && !selected.down ? nearestClosedDoorToOperator(selected) : null;
  ctx.fillStyle = "rgba(16,18,20,0.78)";
  ctx.fillRect(22, 22, 304, nearDoor ? 96 : 74);
  ctx.strokeStyle = "rgba(255,255,255,0.12)";
  ctx.strokeRect(22, 22, 304, nearDoor ? 96 : 74);
  ctx.fillStyle = colors.text;
  ctx.font = "800 18px system-ui";
  ctx.textAlign = "left";
  ctx.fillText(hasManualInput() ? "Manual Control" : (state.running ? "Executing Plan" : "Planning Hold"), 38, 50);
  ctx.fillStyle = colors.muted;
  ctx.font = "600 13px system-ui";
  const pathCount = selected ? selected.path.length : 0;
  ctx.fillText(`Selected ${state.selectedId} | Waypoints ${pathCount}`, 38, 76);
  if (nearDoor) {
    ctx.fillStyle = colors.doorClosed;
    ctx.font = "800 12px system-ui";
    const hint = isLockedDigitalDoor(nearDoor)
      ? "Door locked: press E or click to enter code"
      : (isDigitalLockDoor(nearDoor) ? "Door unlocked: press E or click to open" : "Door nearby: press E or click the door");
    ctx.fillText(hint, 38, 98);
  }
}

function drawDebug() {
  ctx.save();
  ctx.strokeStyle = "rgba(255,255,255,0.28)";
  ctx.lineWidth = 1;
  for (const rect of blockingRects(state.level)) {
    ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
  }

  for (const enemy of state.level.enemies) {
    if (enemy.down) continue;
    ctx.strokeStyle = enemy.targetId ? colors.enemy : "rgba(226,95,95,0.45)";
    ctx.beginPath();
    ctx.arc(enemy.x, enemy.y, enemy.sightRange, 0, TWO_PI);
    ctx.stroke();
  }

  ctx.fillStyle = colors.text;
  ctx.font = "600 12px monospace";
  ctx.textAlign = "left";
  let y = 120;
  for (const op of state.level.operators) {
    ctx.fillText(`${op.id} hp:${op.health.toFixed(0)} action:${op.action ? op.action.type : "none"}`, 28, y);
    y += 18;
  }
  ctx.restore();
}

function onCanvasClick(event) {
  if (!state) return;
  if (state.gameOver) return;
  const pos = getMouseWorld(event);
  const clickedDoor = doorAtPoint(pos);
  if (clickedDoor && openDoorByClick(clickedDoor)) return;

  const clickedOp = state.level.operators.find((op) => !op.down && pointDistance(op, pos) <= op.radius + 8);
  if (clickedOp) {
    state.selectedId = clickedOp.id;
    updateHud();
    return;
  }

  const op = selectedOperator();
  if (!op || op.down) return;
  op.path.push({ x: pos.x, y: pos.y });
  if (op.path.length === 1) {
    op.aim = angleTo(op, op.path[0]);
  }
  updateHud();
}

function onCanvasContext(event) {
  event.preventDefault();
  if (!state) return;
  if (state.gameOver) return;
  const op = selectedOperator();
  if (!op) return;
  op.path = [];
  op.action = null;
  state.message = `${op.id} route cleared`;
  updateHud();
}

function handleKey(event) {
  const key = event.key.toLowerCase();
  if (event.key === "Escape") {
    event.preventDefault();
    if (digitalLockOpen) {
      closeDigitalLock();
    } else {
      toggleSettings();
    }
    return;
  }
  if (!state) return;
  if (gameplayPausedByOverlay()) return;
  if (MANUAL_KEYS.has(key)) {
    event.preventDefault();
    keysDown.add(key);
    updateHud();
  } else if (event.code === "Space") {
    event.preventDefault();
    toggleRun();
  } else if (key === "r") {
    restart();
  } else if (key === "e") {
    event.preventDefault();
    openNearestDoor();
  } else if (event.key === "F3") {
    event.preventDefault();
    state.debug = !state.debug;
    debugButton.classList.toggle("active", state.debug);
  }
}

function handleKeyUp(event) {
  const key = event.key.toLowerCase();
  if (gameplayPausedByOverlay()) return;
  if (MANUAL_KEYS.has(key)) {
    event.preventDefault();
    keysDown.delete(key);
    updateHud();
  }
}

function loop(now) {
  const dt = Math.min(0.05, (now - lastTime) / 1000);
  lastTime = now;
  update(dt);
  draw();
  requestAnimationFrame(loop);
}

canvas.addEventListener("click", onCanvasClick);
canvas.addEventListener("contextmenu", onCanvasContext);
operatorHealthBoard.addEventListener("click", (event) => {
  const card = event.target.closest("[data-operator-id]");
  if (!card) return;
  selectOperator(card.dataset.operatorId);
});
weaponSelect.addEventListener("change", () => {
  const op = selectedOperator();
  if (!op) return;
  op.weaponId = validWeaponId(weaponSelect.value);
  op.fireTimer = 0;
  op.reaction = 0;
  operatorLoadouts[op.id] = op.weaponId;
  state.message = `${op.id} equipped ${weaponById(op.weaponId).name}`;
  updateHud();
});
armorSelect.addEventListener("change", () => {
  const op = selectedOperator();
  if (!op) return;
  applyOperatorArmor(op, armorSelect.value);
});
window.addEventListener("keydown", handleKey);
window.addEventListener("keyup", handleKeyUp);
window.addEventListener("blur", () => {
  keysDown.clear();
  updateHud();
});
runButton.addEventListener("click", toggleRun);
restartButton.addEventListener("click", restart);
bannerRestartButton.addEventListener("click", restart);
nextLevelButton.addEventListener("click", loadNextLevel);
settingsButton.addEventListener("click", openSettings);
closeSettingsButton.addEventListener("click", closeSettings);
settingsOverlay.addEventListener("click", (event) => {
  if (event.target === settingsOverlay) closeSettings();
});
debugButton.addEventListener("click", () => {
  if (!state) return;
  if (gameplayPausedByOverlay()) return;
  state.debug = !state.debug;
  debugButton.classList.toggle("active", state.debug);
});
difficultySelect.addEventListener("change", () => {
  currentDifficulty = difficultySelect.value === "difficult" ? "difficult" : "normal";
  if (state) {
    state.message = currentDifficulty === "difficult" ? "Difficult visibility enabled" : "Normal visibility enabled";
  }
  updateHud();
});
enemyLoadoutList.addEventListener("change", (event) => {
  const weaponSelectEl = event.target.closest("[data-enemy-weapon-id]");
  const armorSelectEl = event.target.closest("[data-enemy-armor-id]");
  if (weaponSelectEl) {
    applyEnemyWeapon(weaponSelectEl.dataset.enemyWeaponId, weaponSelectEl.value);
  } else if (armorSelectEl) {
    applyEnemyArmor(armorSelectEl.dataset.enemyArmorId, armorSelectEl.value);
  }
});
unlockDigitalDoorButton.addEventListener("click", submitDigitalLock);
cancelDigitalLockButton.addEventListener("click", () => closeDigitalLock());
digitalLockOverlay.addEventListener("click", (event) => {
  if (event.target === digitalLockOverlay) closeDigitalLock();
});
digitalLockInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    submitDigitalLock();
  }
});
levelSelect.addEventListener("change", () => {
  settingsResumeRunning = false;
  loadLevel(levelSelect.value);
});
operatorCountSelect.addEventListener("change", () => {
  settingsResumeRunning = false;
  activeOperatorCount = Number(operatorCountSelect.value);
  restart();
});

window.__breachline = {
  getState: () => state,
  getWeapons: () => [...weapons.values()],
  getArmors: () => [...armors.values()],
  restart,
  loadLevel,
  loadNextLevel,
  toggleRun
};

async function boot() {
  populateLevelSelect();
  try {
    await loadEquipment();
    await loadLevel(LEVEL_OPTIONS[0].id);
  } catch (error) {
    state = null;
    levelTitle.textContent = "Load Failed";
    bannerTitle.textContent = "Load Failed";
    bannerText.textContent = error.message;
    banner.classList.remove("hidden");
    updateHud();
  }
}

boot();
requestAnimationFrame(loop);
