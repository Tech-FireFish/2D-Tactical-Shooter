const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const ui = {
  start: document.getElementById("startOverlay"),
  startButton: document.getElementById("startButton"),
  inventory: document.getElementById("inventoryPanel"),
  closeInventory: document.getElementById("closeInventory"),
  openSettings: document.getElementById("openSettings"),
  settings: document.getElementById("settingsPanel"),
  closeSettings: document.getElementById("closeSettings"),
  healthText: document.getElementById("healthText"),
  healthBar: document.getElementById("healthBar"),
  batteryText: document.getElementById("batteryText"),
  batteryBar: document.getElementById("batteryBar"),
  noiseText: document.getElementById("noiseText"),
  noiseBar: document.getElementById("noiseBar"),
  objectiveText: document.getElementById("objectiveText"),
  ammoText: document.getElementById("ammoText"),
  interactHint: document.getElementById("interactHint"),
  radioLog: document.getElementById("radioLog"),
  equipmentList: document.getElementById("equipmentList"),
  bindList: document.getElementById("bindList"),
  settingsList: document.getElementById("settingsList"),
  assistList: document.getElementById("assistList"),
  presetList: document.getElementById("presetList")
};

const TAU = Math.PI * 2;
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const angleTo = (a, b) => Math.atan2(b.y - a.y, b.x - a.x);
const rnd = (min, max) => min + Math.random() * (max - min);

const defaultBinds = {
  up: "KeyW",
  down: "KeyS",
  left: "KeyA",
  right: "KeyD",
  reload: "KeyR",
  interact: "KeyF",
  utility: "KeyE",
  gadget: "KeyQ",
  sprint: "ShiftLeft",
  crouch: "ControlLeft",
  inventory: "Tab",
  dodge: "Space",
  settings: "KeyO"
};

const bindLabels = {
  up: "Move up",
  down: "Move down",
  left: "Move left",
  right: "Move right",
  reload: "Reload",
  interact: "Interact",
  utility: "Quick utility",
  gadget: "Tactical gadget",
  sprint: "Sprint",
  crouch: "Crouch",
  inventory: "Inventory",
  dodge: "Dodge / vault",
  settings: "Lighting settings"
};

function readStoredJson(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key) || "null") || fallback;
  } catch {
    return fallback;
  }
}

const binds = { ...defaultBinds, ...readStoredJson("blacksite-binds", {}) };
const defaultSettings = {
  brightness: 100,
  gamma: 105,
  shadowQuality: "high",
  fogDensity: 70,
  contrast: 112,
  bloomIntensity: 55,
  flashlightIntensity: 100,
  flashlightRange: 100,
  ambientStrength: 28,
  outlineVisibility: true,
  interactableGlow: true,
  enemySilhouettes: false,
  reducedShadowOpacity: false,
  wideBeam: false
};
const settings = { ...defaultSettings, ...readStoredJson("blacksite-lighting-settings", {}) };
const presets = {
  "Realistic Darkness": {
    brightness: 82, gamma: 96, fogDensity: 82, contrast: 122, bloomIntensity: 42,
    flashlightIntensity: 94, flashlightRange: 92, ambientStrength: 12,
    outlineVisibility: false, interactableGlow: false, enemySilhouettes: false,
    reducedShadowOpacity: false, wideBeam: false, shadowQuality: "high"
  },
  "Balanced Tactical": { ...defaultSettings },
  "Exploration Mode": {
    brightness: 130, gamma: 120, fogDensity: 48, contrast: 106, bloomIntensity: 64,
    flashlightIntensity: 118, flashlightRange: 130, ambientStrength: 48,
    outlineVisibility: true, interactableGlow: true, enemySilhouettes: false,
    reducedShadowOpacity: true, wideBeam: true, shadowQuality: "medium"
  },
  "High Visibility": {
    brightness: 164, gamma: 138, fogDensity: 30, contrast: 98, bloomIntensity: 38,
    flashlightIntensity: 135, flashlightRange: 150, ambientStrength: 72,
    outlineVisibility: true, interactableGlow: true, enemySilhouettes: true,
    reducedShadowOpacity: true, wideBeam: true, shadowQuality: "low"
  },
  "Accessibility Enhanced": {
    brightness: 185, gamma: 160, fogDensity: 18, contrast: 92, bloomIntensity: 25,
    flashlightIntensity: 150, flashlightRange: 170, ambientStrength: 92,
    outlineVisibility: true, interactableGlow: true, enemySilhouettes: true,
    reducedShadowOpacity: true, wideBeam: true, shadowQuality: "low"
  }
};

const keys = new Set();
let waitingForBind = null;
let mouse = { x: 0, y: 0, down: false, right: false, worldX: 0, worldY: 0 };
let running = false;
let paused = true;
let lastTime = performance.now();
let camera = { x: 0, y: 0 };
let radioTimer = 0;
let extractionMessageTimer = 0;

const world = {
  width: 2650,
  height: 1900,
  walls: [],
  doors: [],
  lights: [],
  loot: [],
  notes: [],
  decals: [],
  particles: [],
  bullets: [],
  enemies: [],
  soundPings: [],
  objectives: {
    card: false,
    power: false,
    intel: 0,
    extracted: false
  },
  alarm: 0,
  shake: 0,
  seed: Math.floor(Math.random() * 9000)
};

const player = {
  x: 180,
  y: 230,
  radius: 13,
  angle: 0,
  vx: 0,
  vy: 0,
  health: 100,
  battery: 100,
  ammo: 12,
  reserve: 36,
  magSize: 12,
  reload: 0,
  fireCooldown: 0,
  recoil: 0,
  noise: 0,
  medkits: 1,
  sensors: 2,
  charges: 1,
  hasNightVision: false,
  focus: false,
  crouch: false,
  invulnerable: 0,
  extracted: false
};

const equipmentNames = [
  ["Suppressed 9mm", () => `${player.ammo}/${player.reserve}`],
  ["Weapon light", () => `${Math.round(player.battery)}%`],
  ["Medkits", () => player.medkits],
  ["Motion sensors", () => player.sensors],
  ["Breaching charge", () => player.charges],
  ["Access card", () => world.objectives.card ? "secured" : "missing"],
  ["Recovered intel", () => `${world.objectives.intel}/3`]
];

const settingControls = [
  ["brightness", "Brightness", "Ambient darkness, visibility radius, fog, and dark-area contrast.", 0, 200, 1, "%"],
  ["gamma", "Gamma", "Raises black levels so dark scenes stay readable.", 50, 200, 1, "%"],
  ["fogDensity", "Fog Density", "Controls how much darkness sits over distant interiors.", 0, 100, 1, "%"],
  ["contrast", "Contrast", "Canvas contrast in dark areas.", 60, 160, 1, "%"],
  ["bloomIntensity", "Bloom Intensity", "Glow strength from flashlights, muzzle flashes, lamps, and electronics.", 0, 120, 1, "%"],
  ["flashlightIntensity", "Flashlight Intensity", "Light strength and battery cost.", 40, 200, 1, "%"],
  ["flashlightRange", "Flashlight Range", "Beam reach and battery cost.", 50, 200, 1, "%"],
  ["ambientStrength", "Ambient Light Strength", "Global minimum visibility without removing tension.", 0, 120, 1, "%"]
];

const assistControls = [
  ["outlineVisibility", "Increase wall and object outlines"],
  ["interactableGlow", "Edge glow on interactable items"],
  ["enemySilhouettes", "Enemy silhouette visibility"],
  ["reducedShadowOpacity", "Reduced shadow opacity"],
  ["wideBeam", "Wider beam exploration mode"]
];

function resize() {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.floor(window.innerWidth * dpr);
  canvas.height = Math.floor(window.innerHeight * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function brightnessScale() {
  return settings.brightness / 100;
}

function gammaScale() {
  return settings.gamma / 100;
}

function ambientScale() {
  return settings.ambientStrength / 100;
}

function flashlightPower() {
  return settings.flashlightIntensity / 100;
}

function flashlightReach() {
  return settings.flashlightRange / 100;
}

function bloomScale() {
  return settings.bloomIntensity / 100;
}

function nearVisibilityRadius() {
  return 62 + settings.brightness * 0.26 + settings.gamma * 0.11 + settings.ambientStrength * 0.28;
}

function beamSpread() {
  return settings.wideBeam ? 1.34 : 1;
}

function addWall(x, y, w, h, type = "concrete") {
  world.walls.push({ x, y, w, h, type });
}

function addDoor(x, y, w, h, locked = false, label = "Door") {
  world.doors.push({ x, y, w, h, locked, open: false, hp: 80, label });
}

function makeWorld() {
  world.walls.length = 0;
  world.doors.length = 0;
  world.lights.length = 0;
  world.loot.length = 0;
  world.notes.length = 0;
  world.decals.length = 0;
  world.particles.length = 0;
  world.bullets.length = 0;
  world.enemies.length = 0;
  world.soundPings.length = 0;

  addWall(-40, -40, world.width + 80, 40);
  addWall(-40, world.height, world.width + 80, 40);
  addWall(-40, -40, 40, world.height + 80);
  addWall(world.width, -40, 40, world.height + 80);

  const rooms = [
    [80, 100, 560, 360], [720, 90, 510, 390], [1320, 90, 510, 390], [1940, 120, 520, 340],
    [80, 560, 470, 390], [650, 550, 620, 370], [1370, 570, 420, 430], [1880, 560, 560, 410],
    [120, 1090, 560, 380], [780, 1070, 480, 420], [1380, 1110, 520, 360], [2020, 1080, 430, 450]
  ];

  rooms.forEach(([x, y, w, h], i) => {
    addWall(x, y, w, 24);
    addWall(x, y + h - 24, w, 24);
    addWall(x, y, 24, h);
    addWall(x + w - 24, y, 24, h);
    if (i % 2 === 0) {
      addWall(x + w * 0.52, y + 86, 22, h - 170, "partition");
    }
  });

  const corridors = [
    [620, 240, 120, 82], [1225, 245, 100, 82], [1825, 245, 120, 82],
    [305, 456, 90, 120], [900, 456, 90, 100], [1550, 456, 90, 130], [2150, 456, 90, 110],
    [550, 720, 105, 88], [1270, 735, 105, 88], [1790, 735, 95, 88],
    [330, 950, 95, 150], [950, 935, 92, 140], [1570, 980, 94, 140], [2200, 970, 96, 120],
    [680, 1240, 100, 78], [1260, 1240, 120, 78], [1900, 1280, 120, 78]
  ];
  corridors.forEach(([x, y, w, h]) => addWall(x, y, w, h, "corridor-rim"));

  addWall(420, 650, 52, 170, "shelves");
  addWall(790, 675, 240, 28, "labbench");
  addWall(930, 785, 220, 28, "labbench");
  addWall(1465, 690, 36, 210, "server");
  addWall(1610, 700, 36, 210, "server");
  addWall(2030, 660, 250, 34, "vehicle");
  addWall(2145, 765, 58, 150, "vehicle");
  addWall(285, 1200, 230, 32, "barricade");
  addWall(870, 1165, 90, 250, "elevator");
  addWall(1510, 1185, 200, 36, "reactor");
  addWall(2130, 1180, 210, 40, "barricade");

  [
    [620, 265, 40, 30, false, "Security door"],
    [1225, 270, 40, 30, false, "Office door"],
    [1825, 270, 40, 30, true, "Keycard door"],
    [318, 456, 42, 35, false, "Stairwell hatch"],
    [910, 456, 42, 35, true, "Powered shutter"],
    [1560, 456, 42, 35, false, "Containment door"],
    [560, 745, 42, 34, false, "Maintenance door"],
    [1285, 760, 42, 34, false, "Lab door"],
    [1810, 760, 42, 34, true, "Armory shutter"],
    [690, 1263, 44, 30, false, "Apartment door"],
    [1288, 1263, 44, 30, false, "Service door"],
    [1910, 1302, 44, 30, true, "Extraction gate"]
  ].forEach(d => addDoor(...d));

  const lightSpots = [
    [240, 250, 180, "#a7ebe3", true], [860, 210, 145, "#d7f7e8", false],
    [1135, 385, 120, "#ef665f", true], [1510, 265, 125, "#73f4d6", false],
    [2240, 265, 160, "#e4f2d6", true], [275, 720, 135, "#f1bd6a", true],
    [770, 790, 160, "#a7ebe3", false], [1660, 760, 125, "#73f4d6", true],
    [2140, 780, 190, "#ef665f", true], [430, 1290, 130, "#f1bd6a", false],
    [1040, 1235, 145, "#a7ebe3", true], [1600, 1270, 170, "#73f4d6", false],
    [2300, 1270, 130, "#d7f7e8", true]
  ];
  lightSpots.forEach(([x, y, radius, color, flicker], i) => world.lights.push({
    x, y, radius, color, flicker, active: i < 7, phase: Math.random() * TAU
  }));

  addLoot(1050, 220, "ammo", 18);
  addLoot(470, 760, "battery", 35);
  addLoot(1700, 810, "medkit", 1);
  addLoot(2145, 315, "card", 1);
  addLoot(1510, 1285, "power", 1);
  addLoot(2220, 1335, "extraction", 1);
  addLoot(900, 835, "sensor", 1);
  addLoot(2015, 760, "charge", 1);
  addLoot(420, 1325, "ammo", 12);

  [
    [350, 315, "Recorder: 'Do not follow the knocking. It learned our patrol timings.'"],
    [1485, 345, "Graffiti: LIGHT MAKES THEM ANGRY"],
    [1685, 1275, "Terminal: Auxiliary power can open east gates."],
    [960, 1180, "Report: Rogue unit entered through apartments, no extraction logged."],
    [2170, 670, "Blood trail: dragged toward the armory shutter."],
    [2365, 1315, "Extraction route: flood tunnel under service yard."]
  ].forEach(([x, y, text]) => world.notes.push({ x, y, text, read: false }));

  for (let i = 0; i < 42; i++) {
    world.decals.push({
      x: rnd(130, world.width - 180),
      y: rnd(140, world.height - 180),
      r: rnd(4, 18),
      type: Math.random() > 0.7 ? "blood" : "debris",
      a: rnd(0.25, 0.8)
    });
  }

  spawnEnemy(840, 340, "survivor");
  spawnEnemy(1160, 805, "survivor");
  spawnEnemy(1570, 820, "stalker");
  spawnEnemy(2140, 850, "military");
  spawnEnemy(520, 1330, "survivor");
  spawnEnemy(1090, 1310, "military");
  spawnEnemy(1760, 1320, "turret");
  spawnEnemy(2300, 1235, "stalker");
}

function addLoot(x, y, type, amount) {
  world.loot.push({ x, y, type, amount, taken: false, pulse: Math.random() * TAU });
}

function spawnEnemy(x, y, type) {
  const data = {
    survivor: { hp: 55, speed: 72, color: "#d6b36e", range: 310, damage: 11 },
    military: { hp: 90, speed: 58, color: "#9db7b1", range: 420, damage: 16 },
    stalker: { hp: 70, speed: 90, color: "#c86868", range: 220, damage: 18 },
    turret: { hp: 80, speed: 0, color: "#73f4d6", range: 480, damage: 14 }
  }[type];

  world.enemies.push({
    x, y, type,
    radius: type === "turret" ? 16 : 14,
    hp: data.hp,
    maxHp: data.hp,
    speed: data.speed,
    color: data.color,
    range: data.range,
    damage: data.damage,
    state: "idle",
    angle: Math.random() * TAU,
    targetX: x,
    targetY: y,
    lastSeenX: x,
    lastSeenY: y,
    fireCooldown: rnd(0.4, 1.4),
    alert: 0,
    suppress: 0,
    wander: rnd(1, 4),
    dead: false
  });
}

function isSolid(rect, ignoreDoorOpen = true) {
  for (const wall of world.walls) {
    if (rectsOverlap(rect, wall) && !rectOverlapsOpenDoorway(rect, wall)) return true;
  }
  for (const door of world.doors) {
    if ((!ignoreDoorOpen || !door.open) && rectsOverlap(rect, door)) return true;
  }
  return false;
}

function rectOverlapsOpenDoorway(rect, wall) {
  return world.doors.some(door => door.open && rectsOverlap(wall, door) && rectsOverlap(rect, inflateRect(door, 8)));
}

function inflateRect(rect, amount) {
  return {
    x: rect.x - amount,
    y: rect.y - amount,
    w: rect.w + amount * 2,
    h: rect.h + amount * 2
  };
}

function rectsOverlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function lineIntersectsRect(x1, y1, x2, y2, rect) {
  if (x1 >= rect.x && x1 <= rect.x + rect.w && y1 >= rect.y && y1 <= rect.y + rect.h) return true;
  const lines = [
    [rect.x, rect.y, rect.x + rect.w, rect.y],
    [rect.x + rect.w, rect.y, rect.x + rect.w, rect.y + rect.h],
    [rect.x + rect.w, rect.y + rect.h, rect.x, rect.y + rect.h],
    [rect.x, rect.y + rect.h, rect.x, rect.y]
  ];
  return lines.some(l => segmentsIntersect(x1, y1, x2, y2, ...l));
}

function segmentsIntersect(x1, y1, x2, y2, x3, y3, x4, y4) {
  const d = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
  if (Math.abs(d) < 0.001) return false;
  const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / d;
  const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / d;
  return t >= 0 && t <= 1 && u >= 0 && u <= 1;
}

function hasLineOfSight(a, b) {
  for (const wall of world.walls) {
    if (lineIntersectsRect(a.x, a.y, b.x, b.y, wall) && !lineUsesOpenDoorway(a, b, wall)) return false;
  }
  for (const door of world.doors) {
    if (!door.open && lineIntersectsRect(a.x, a.y, b.x, b.y, door)) return false;
  }
  return true;
}

function lineUsesOpenDoorway(a, b, wall) {
  return world.doors.some(door => door.open && rectsOverlap(wall, door) && lineIntersectsRect(a.x, a.y, b.x, b.y, inflateRect(door, 5)));
}

function lightVisible(point) {
  if (dist(point, player) < nearVisibilityRadius() && hasLineOfSight(player, point)) return true;
  const flashlightAngle = angleDiff(player.angle, angleTo(player, point));
  const focusBonus = player.focus ? 0.18 : 0;
  const cone = (player.focus ? 0.34 : 0.52) * beamSpread();
  const range = (player.focus ? 500 : 375) * flashlightReach() * (0.82 + flashlightPower() * 0.24);
  if (Math.abs(flashlightAngle) < cone + focusBonus && dist(player, point) < range && hasLineOfSight(player, point)) return true;
  for (const light of world.lights) {
    const interiorBoost = 0.72 + ambientScale() * 0.38 + brightnessScale() * 0.18 + gammaScale() * 0.1;
    if (light.active && dist(light, point) < light.radius * 0.88 * interiorBoost && hasLineOfSight(light, point)) return true;
  }
  for (const p of world.particles) {
    if (p.light && dist(p, point) < p.light && hasLineOfSight(p, point)) return true;
  }
  return false;
}

function angleDiff(a, b) {
  return Math.atan2(Math.sin(b - a), Math.cos(b - a));
}

function canHearEnemy(enemy) {
  return dist(enemy, player) < (enemy.type === "stalker" ? 300 : 220) && !lightVisible(enemy);
}

function moveCircle(entity, dx, dy) {
  const r = entity.radius || 12;
  const nextX = { x: entity.x + dx - r, y: entity.y - r, w: r * 2, h: r * 2 };
  if (!isSolid(nextX)) entity.x += dx;
  const nextY = { x: entity.x - r, y: entity.y + dy - r, w: r * 2, h: r * 2 };
  if (!isSolid(nextY)) entity.y += dy;
}

function update(dt) {
  if (paused) return;
  player.focus = mouse.right;
  player.crouch = keys.has(binds.crouch);
  player.angle = Math.atan2(mouse.worldY - player.y, mouse.worldX - player.x);
  player.fireCooldown = Math.max(0, player.fireCooldown - dt);
  player.reload = Math.max(0, player.reload - dt);
  player.recoil = Math.max(0, player.recoil - dt * 3.4);
  player.invulnerable = Math.max(0, player.invulnerable - dt);
  player.noise = Math.max(0, player.noise - dt * 45);
  world.alarm = Math.max(0, world.alarm - dt * 0.08);
  world.shake = Math.max(0, world.shake - dt * 18);

  const mx = (keys.has(binds.right) ? 1 : 0) - (keys.has(binds.left) ? 1 : 0);
  const my = (keys.has(binds.down) ? 1 : 0) - (keys.has(binds.up) ? 1 : 0);
  const len = Math.hypot(mx, my) || 1;
  const sprinting = keys.has(binds.sprint) && player.battery > 0 && !player.crouch;
  const speed = (player.crouch ? 72 : sprinting ? 178 : player.focus ? 86 : 122) * (player.reload > 0 ? 0.72 : 1);
  if (mx || my) {
    moveCircle(player, (mx / len) * speed * dt, (my / len) * speed * dt);
    player.noise = Math.max(player.noise, player.crouch ? 15 : sprinting ? 86 : 38);
  }

  const lightDrain = (0.45 + flashlightPower() * 0.55 + flashlightReach() * 0.38 + (settings.wideBeam ? 0.22 : 0)) * (player.focus ? 1.45 : 0.72);
  if (sprinting) player.battery = Math.max(0, player.battery - dt * 2.2);
  player.battery = Math.max(0, player.battery - dt * lightDrain);

  if (mouse.down) fireWeapon();

  updateBullets(dt);
  updateEnemies(dt);
  updateParticles(dt);
  updateLights(dt);
  updateCamera();
  updateInteractionHint();
  updateUI();
  maybeRandomEvent(dt);
}

function fireWeapon() {
  if (player.fireCooldown > 0 || player.reload > 0 || player.extracted) return;
  if (player.ammo <= 0) {
    addRadio("Dry magazine. Reload.");
    player.fireCooldown = 0.25;
    return;
  }

  player.ammo--;
  player.fireCooldown = player.focus ? 0.22 : 0.29;
  player.recoil = Math.min(1, player.recoil + (player.focus ? 0.22 : 0.38));
  player.noise = Math.max(player.noise, player.focus ? 82 : 100);
  world.shake = Math.max(world.shake, 4);
  addSoundPing(player.x, player.y, player.focus ? 430 : 560, "gunshot");

  const spread = (player.focus ? 0.035 : 0.115) + player.recoil * 0.06;
  const angle = player.angle + rnd(-spread, spread);
  world.bullets.push({
    x: player.x + Math.cos(angle) * 17,
    y: player.y + Math.sin(angle) * 17,
    vx: Math.cos(angle) * 940,
    vy: Math.sin(angle) * 940,
    life: 0.55,
    fromPlayer: true,
    damage: player.focus ? 38 : 30,
    penetration: 1
  });
  addMuzzleFlash(player.x + Math.cos(angle) * 25, player.y + Math.sin(angle) * 25, angle);
}

function reload() {
  if (player.reload > 0 || player.ammo === player.magSize || player.reserve <= 0) return;
  player.reload = 1.45;
  addRadio("Reloading.");
  setTimeout(() => {
    if (paused || player.extracted) return;
    const need = player.magSize - player.ammo;
    const take = Math.min(need, player.reserve);
    player.ammo += take;
    player.reserve -= take;
  }, 1450);
}

function useUtility() {
  if (player.medkits > 0 && player.health < 100) {
    player.medkits--;
    player.health = Math.min(100, player.health + 42);
    addRadio("Hemostatic applied.");
    pulse(player.x, player.y, "#b8ece1", 52, 0.55);
  } else {
    addRadio("No medical use right now.");
  }
}

function useGadget() {
  if (player.sensors <= 0) {
    addRadio("No motion sensors left.");
    return;
  }
  player.sensors--;
  addRadio("Sensor ping deployed.");
  addSoundPing(player.x, player.y, 620, "sensor");
  for (const enemy of world.enemies) {
    if (!enemy.dead && dist(enemy, player) < 620) {
      pulse(enemy.x, enemy.y, enemy.type === "stalker" ? "#ef665f" : "#73f4d6", 80, 1.1);
      enemy.alert = Math.max(enemy.alert, 0.7);
    }
  }
}

function dodge() {
  if (player.invulnerable > 0 || player.reload > 0) return;
  const dx = Math.cos(player.angle) * 72;
  const dy = Math.sin(player.angle) * 72;
  moveCircle(player, dx, dy);
  player.invulnerable = 0.38;
  player.noise = Math.max(player.noise, 72);
  addSoundPing(player.x, player.y, 260, "vault");
}

function interact() {
  const target = nearestInteractable();
  if (!target) return;
  if (target.kind === "door") {
    const door = target.item;
    if (door.locked && door.label.includes("Keycard") && !world.objectives.card) {
      addRadio("Keycard required.");
      return;
    }
    if (door.locked && door.label.includes("Powered") && !world.objectives.power) {
      addRadio("Auxiliary power is offline.");
      return;
    }
    if (door.locked && door.label.includes("Armory") && player.charges <= 0) {
      addRadio("Breaching charge required.");
      return;
    }
    if (door.locked && door.label.includes("Extraction") && !world.objectives.power) {
      addRadio("Gate motor has no power.");
      return;
    }
    if (door.locked && door.label.includes("Armory")) {
      player.charges--;
      breachDoor(door);
      return;
    }
    door.open = !door.open;
    addSoundPing(door.x, door.y, 300, "door");
    addRadio(door.open ? `${door.label} opened.` : `${door.label} closed.`);
  }
  if (target.kind === "loot") {
    collectLoot(target.item);
  }
  if (target.kind === "note") {
    target.item.read = true;
    addRadio(target.item.text);
    world.objectives.intel = Math.min(3, world.objectives.intel + 1);
  }
}

function breachDoor(door) {
  door.open = true;
  door.locked = false;
  world.shake = 14;
  addRadio("Charge set. Breach!");
  addSoundPing(door.x, door.y, 760, "breach");
  for (let i = 0; i < 28; i++) {
    world.particles.push({
      x: door.x + door.w / 2, y: door.y + door.h / 2,
      vx: rnd(-180, 180), vy: rnd(-180, 180),
      life: rnd(0.4, 1.1), maxLife: 1.1, size: rnd(2, 6),
      color: Math.random() > 0.5 ? "#f1bd6a" : "#9ba6a4", light: 90
    });
  }
}

function nearestInteractable() {
  let best = null;
  const consider = (kind, item, range) => {
    const d = Math.hypot((item.x + (item.w || 0) / 2) - player.x, (item.y + (item.h || 0) / 2) - player.y);
    if (d < range && (!best || d < best.d)) best = { kind, item, d };
  };
  world.doors.forEach(door => consider("door", door, 72));
  world.loot.filter(l => !l.taken).forEach(l => consider("loot", l, 58));
  world.notes.filter(n => !n.read).forEach(n => consider("note", n, 58));
  return best;
}

function collectLoot(item) {
  item.taken = true;
  if (item.type === "ammo") {
    player.reserve += item.amount;
    addRadio(`Recovered ${item.amount} rounds.`);
  } else if (item.type === "battery") {
    player.battery = Math.min(100, player.battery + item.amount);
    addRadio("Battery pack connected.");
  } else if (item.type === "medkit") {
    player.medkits += item.amount;
    addRadio("Medical kit secured.");
  } else if (item.type === "sensor") {
    player.sensors += item.amount;
    addRadio("Motion sensor added.");
  } else if (item.type === "charge") {
    player.charges += item.amount;
    addRadio("Breaching charge recovered.");
  } else if (item.type === "card") {
    world.objectives.card = true;
    addRadio("Access card acquired. Eastern security wing is reachable.");
  } else if (item.type === "power") {
    world.objectives.power = true;
    world.lights.forEach(l => l.active = true);
    world.doors.filter(d => d.label.includes("Powered")).forEach(d => d.locked = false);
    addRadio("Auxiliary power restored. Facility systems waking up.");
    world.alarm = 1;
  } else if (item.type === "extraction") {
    if (world.objectives.power) {
      player.extracted = true;
      world.objectives.extracted = true;
      extractionMessageTimer = 4;
      addRadio("Extraction confirmed. You made it out.");
    } else {
      item.taken = false;
      addRadio("Extraction gate is dead. Restore power.");
    }
  }
  pulse(item.x, item.y, "#73f4d6", 72, 0.7);
}

function updateBullets(dt) {
  for (const bullet of world.bullets) {
    bullet.x += bullet.vx * dt;
    bullet.y += bullet.vy * dt;
    bullet.life -= dt;

    for (const wall of world.walls) {
      if (rectsOverlap({ x: bullet.x - 2, y: bullet.y - 2, w: 4, h: 4 }, wall)) {
        bullet.life = -1;
        spark(bullet.x, bullet.y);
      }
    }
    for (const door of world.doors) {
      if (!door.open && rectsOverlap({ x: bullet.x - 2, y: bullet.y - 2, w: 4, h: 4 }, door)) {
        door.hp -= bullet.damage * 0.35;
        spark(bullet.x, bullet.y);
        if (door.hp <= 0) door.open = true;
        if (bullet.penetration-- <= 0) bullet.life = -1;
      }
    }
    if (bullet.fromPlayer) {
      for (const enemy of world.enemies) {
        if (!enemy.dead && Math.hypot(enemy.x - bullet.x, enemy.y - bullet.y) < enemy.radius + 4) {
          enemy.hp -= bullet.damage;
          enemy.alert = 1;
          enemy.lastSeenX = player.x;
          enemy.lastSeenY = player.y;
          enemy.suppress = 1;
          bullet.life = -1;
          blood(enemy.x, enemy.y);
          if (enemy.hp <= 0) {
            enemy.dead = true;
            addRadio(`${enemy.type} neutralized.`);
          }
        }
      }
    } else if (Math.hypot(player.x - bullet.x, player.y - bullet.y) < player.radius + 4 && player.invulnerable <= 0) {
      player.health -= bullet.damage;
      bullet.life = -1;
      world.shake = Math.max(world.shake, 7);
      blood(player.x, player.y);
      addRadio("Hit. Keep moving.");
    }
  }
  world.bullets = world.bullets.filter(b => b.life > 0);
}

function updateEnemies(dt) {
  for (const enemy of world.enemies) {
    if (enemy.dead) continue;
    enemy.fireCooldown -= dt;
    enemy.wander -= dt;
    enemy.suppress = Math.max(0, enemy.suppress - dt);

    const seesPlayer = dist(enemy, player) < enemy.range && hasLineOfSight(enemy, player) && (lightVisible(player) || player.noise > 50 || enemy.type !== "stalker");
    const hearsPlayer = dist(enemy, player) < player.noise * 5.5 && player.noise > 28;

    if (seesPlayer) {
      enemy.state = "attack";
      enemy.alert = 1;
      enemy.lastSeenX = player.x;
      enemy.lastSeenY = player.y;
    } else if (hearsPlayer || world.soundPings.some(p => dist(enemy, p) < p.radius)) {
      enemy.state = "investigate";
      enemy.alert = Math.max(enemy.alert, 0.65);
      enemy.lastSeenX = player.x + rnd(-50, 50);
      enemy.lastSeenY = player.y + rnd(-50, 50);
    } else {
      enemy.alert = Math.max(0, enemy.alert - dt * 0.2);
      if (enemy.alert <= 0.05) enemy.state = "idle";
    }

    if (enemy.type === "turret") {
      enemy.angle += dt * 0.4;
      if (seesPlayer && enemy.fireCooldown <= 0) enemyShoot(enemy);
      continue;
    }

    let tx = enemy.targetX;
    let ty = enemy.targetY;
    if (enemy.state === "attack") {
      const flank = enemy.type === "military" ? Math.sin(performance.now() / 600 + enemy.x) * 90 : 0;
      const a = angleTo(enemy, player) + Math.PI / 2;
      tx = player.x + Math.cos(a) * flank;
      ty = player.y + Math.sin(a) * flank;
      if (enemy.fireCooldown <= 0 && dist(enemy, player) < enemy.range * 0.8 && hasLineOfSight(enemy, player)) enemyShoot(enemy);
    } else if (enemy.state === "investigate") {
      tx = enemy.lastSeenX;
      ty = enemy.lastSeenY;
    } else if (enemy.wander <= 0) {
      tx = enemy.x + rnd(-170, 170);
      ty = enemy.y + rnd(-170, 170);
      enemy.targetX = clamp(tx, 80, world.width - 80);
      enemy.targetY = clamp(ty, 80, world.height - 80);
      enemy.wander = rnd(2, 5);
    }

    enemy.angle = angleTo(enemy, { x: tx, y: ty });
    const away = enemy.suppress > 0.1 ? -0.45 : 1;
    const speed = enemy.speed * (enemy.state === "attack" ? 1.08 : enemy.state === "investigate" ? 0.72 : 0.38) * away;
    if (dist(enemy, { x: tx, y: ty }) > 22) {
      moveCircle(enemy, Math.cos(enemy.angle) * speed * dt, Math.sin(enemy.angle) * speed * dt);
    }

    if (enemy.type === "stalker" && lightVisible(enemy)) {
      enemy.suppress = Math.max(enemy.suppress, 0.45);
    }

    if (dist(enemy, player) < enemy.radius + player.radius + 4 && player.invulnerable <= 0) {
      player.health -= enemy.damage * dt * 2.5;
      player.noise = Math.max(player.noise, 78);
      world.shake = Math.max(world.shake, 3);
    }
  }
}

function enemyShoot(enemy) {
  enemy.fireCooldown = enemy.type === "military" ? rnd(0.32, 0.55) : rnd(0.75, 1.25);
  enemy.angle = angleTo(enemy, player);
  const spread = enemy.type === "military" ? 0.08 : 0.14;
  const angle = enemy.angle + rnd(-spread, spread);
  world.bullets.push({
    x: enemy.x + Math.cos(angle) * 18,
    y: enemy.y + Math.sin(angle) * 18,
    vx: Math.cos(angle) * 770,
    vy: Math.sin(angle) * 770,
    life: 0.65,
    fromPlayer: false,
    damage: enemy.damage,
    penetration: 0
  });
  addMuzzleFlash(enemy.x + Math.cos(angle) * 21, enemy.y + Math.sin(angle) * 21, angle);
  addSoundPing(enemy.x, enemy.y, 520, "hostile fire");
}

function updateParticles(dt) {
  for (const p of world.particles) {
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vx *= 0.96;
    p.vy *= 0.96;
    p.life -= dt;
  }
  world.particles = world.particles.filter(p => p.life > 0);
  for (const ping of world.soundPings) ping.life -= dt;
  world.soundPings = world.soundPings.filter(p => p.life > 0);
}

function updateLights(dt) {
  for (const light of world.lights) {
    light.phase += dt * (light.flicker ? rnd(4, 9) : 0.7);
    if (light.flicker && Math.random() < dt * 0.22) light.active = Math.random() > 0.22 || world.objectives.power;
  }
}

function updateCamera() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const sx = world.shake ? rnd(-world.shake, world.shake) : 0;
  const sy = world.shake ? rnd(-world.shake, world.shake) : 0;
  camera.x = clamp(player.x - w / 2 + sx, 0, world.width - w);
  camera.y = clamp(player.y - h / 2 + sy, 0, world.height - h);
  mouse.worldX = mouse.x + camera.x;
  mouse.worldY = mouse.y + camera.y;
}

function updateInteractionHint() {
  const target = nearestInteractable();
  if (!target) {
    ui.interactHint.textContent = "Interact";
    return;
  }
  if (target.kind === "door") ui.interactHint.textContent = target.item.open ? "Close door" : target.item.locked ? target.item.label : "Open door";
  if (target.kind === "loot") ui.interactHint.textContent = target.item.type === "extraction" ? "Extract" : `Take ${target.item.type}`;
  if (target.kind === "note") ui.interactHint.textContent = "Read";
}

function maybeRandomEvent(dt) {
  radioTimer -= dt;
  extractionMessageTimer = Math.max(0, extractionMessageTimer - dt);
  if (radioTimer <= 0) {
    radioTimer = rnd(9, 18);
    const lines = [
      "Radio: command channel is breaking up.",
      "Distant impact detected below your position.",
      "You hear footsteps through the wall.",
      "Emergency lighting unstable.",
      "Unknown signal sweeping the sector."
    ];
    addRadio(lines[Math.floor(Math.random() * lines.length)]);
    if (Math.random() > 0.68) {
      const x = player.x + rnd(-480, 480);
      const y = player.y + rnd(-360, 360);
      addSoundPing(clamp(x, 80, world.width - 80), clamp(y, 80, world.height - 80), 330, "distant noise");
    }
  }
}

function addMuzzleFlash(x, y, angle) {
  world.particles.push({ x, y, vx: Math.cos(angle) * 20, vy: Math.sin(angle) * 20, life: 0.08, maxLife: 0.08, size: 34, color: "#fff0a6", light: 220 });
  for (let i = 0; i < 5; i++) {
    world.particles.push({ x, y, vx: rnd(-90, 90), vy: rnd(-90, 90), life: rnd(0.12, 0.28), maxLife: 0.28, size: rnd(1, 3), color: "#f1bd6a", light: 40 });
  }
}

function spark(x, y) {
  for (let i = 0; i < 5; i++) {
    world.particles.push({ x, y, vx: rnd(-110, 110), vy: rnd(-110, 110), life: rnd(0.12, 0.34), maxLife: 0.34, size: rnd(1, 3), color: "#f1bd6a", light: 55 });
  }
}

function blood(x, y) {
  world.decals.push({ x: x + rnd(-8, 8), y: y + rnd(-8, 8), r: rnd(8, 22), type: "blood", a: 0.75 });
  for (let i = 0; i < 8; i++) {
    world.particles.push({ x, y, vx: rnd(-70, 70), vy: rnd(-70, 70), life: rnd(0.2, 0.55), maxLife: 0.55, size: rnd(2, 4), color: "#6d1619", light: 0 });
  }
}

function pulse(x, y, color, size, life) {
  world.particles.push({ x, y, vx: 0, vy: 0, life, maxLife: life, size, color, light: size * 1.5, ring: true });
}

function addSoundPing(x, y, radius, label) {
  world.soundPings.push({ x, y, radius, life: 0.75, maxLife: 0.75, label });
}

function addRadio(text) {
  ui.radioLog.textContent = text;
}

function draw() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  ctx.clearRect(0, 0, w, h);
  ctx.save();
  ctx.translate(-camera.x, -camera.y);
  drawWorld();
  drawEntities();
  drawDarkness();
  drawForegroundEffects();
  ctx.restore();
  drawScreenEffects(w, h);
  requestAnimationFrame(loop);
}

function drawWorld() {
  ctx.fillStyle = "#171b1c";
  ctx.fillRect(0, 0, world.width, world.height);

  ctx.strokeStyle = "rgba(255,255,255,0.025)";
  ctx.lineWidth = 1;
  for (let x = 0; x < world.width; x += 48) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, world.height);
    ctx.stroke();
  }
  for (let y = 0; y < world.height; y += 48) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(world.width, y);
    ctx.stroke();
  }

  for (const decal of world.decals) {
    ctx.globalAlpha = decal.a;
    ctx.fillStyle = decal.type === "blood" ? "#321013" : "#5a5f5d";
    ctx.beginPath();
    ctx.ellipse(decal.x, decal.y, decal.r * 1.5, decal.r * 0.6, rnd(0, TAU), 0, TAU);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  for (const wall of world.walls) {
    const colors = {
      concrete: "#303536",
      partition: "#252a2b",
      shelves: "#262f30",
      labbench: "#263337",
      server: "#1e3438",
      vehicle: "#343739",
      barricade: "#3a3029",
      reactor: "#24383b",
      elevator: "#202628",
      "corridor-rim": "#191f20"
    };
    ctx.fillStyle = colors[wall.type] || "#303536";
    ctx.fillRect(wall.x, wall.y, wall.w, wall.h);
    const outlineAlpha = settings.outlineVisibility ? 0.08 + settings.brightness * 0.00055 + settings.gamma * 0.00035 : 0.04;
    ctx.strokeStyle = `rgba(180,210,205,${clamp(outlineAlpha, 0.035, 0.22)})`;
    ctx.strokeRect(wall.x + 0.5, wall.y + 0.5, wall.w - 1, wall.h - 1);
  }

  for (const door of world.doors) {
    if (door.open) {
      ctx.fillStyle = "rgba(115,244,214,0.16)";
      ctx.fillRect(door.x, door.y, door.w, door.h);
    } else {
      ctx.fillStyle = door.locked ? "#51333a" : "#4c514d";
      ctx.fillRect(door.x, door.y, door.w, door.h);
      const doorAlpha = settings.outlineVisibility ? 0.36 : 0.18;
      ctx.strokeStyle = door.locked ? "rgba(239,102,95,0.5)" : `rgba(220,230,220,${doorAlpha})`;
      ctx.strokeRect(door.x + 1, door.y + 1, door.w - 2, door.h - 2);
    }
  }

  for (const light of world.lights) {
    ctx.fillStyle = light.active ? light.color : "#333";
    ctx.globalAlpha = light.active ? 0.9 : 0.25;
    ctx.beginPath();
    ctx.arc(light.x, light.y, 5, 0, TAU);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  drawLootAndNotes();
}

function drawLootAndNotes() {
  for (const loot of world.loot) {
    if (loot.taken) continue;
    loot.pulse += 0.04;
    const visible = lightVisible(loot) || dist(loot, player) < 80;
    if (!visible) continue;
    const colors = {
      ammo: "#d6dd83",
      battery: "#f1bd6a",
      medkit: "#b8ece1",
      card: "#73f4d6",
      power: "#ef665f",
      sensor: "#9db7ff",
      charge: "#f1bd6a",
      extraction: "#ffffff"
    };
    ctx.fillStyle = colors[loot.type] || "#fff";
    ctx.globalAlpha = 0.7 + Math.sin(loot.pulse) * 0.25;
    ctx.fillRect(loot.x - 7, loot.y - 7, 14, 14);
    if (settings.interactableGlow) {
      ctx.globalAlpha = 0.25 + Math.sin(loot.pulse) * 0.12;
      ctx.strokeStyle = colors[loot.type] || "#fff";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(loot.x, loot.y, 20, 0, TAU);
      ctx.stroke();
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.9;
    }
    ctx.strokeStyle = settings.interactableGlow ? "rgba(255,255,255,0.72)" : "rgba(255,255,255,0.45)";
    ctx.strokeRect(loot.x - 10, loot.y - 10, 20, 20);
  }
  for (const note of world.notes) {
    if (note.read || !lightVisible(note)) continue;
    ctx.globalAlpha = 0.8;
    ctx.fillStyle = "#b9aaa1";
    ctx.fillRect(note.x - 8, note.y - 6, 16, 12);
  }
  ctx.globalAlpha = 1;
}

function drawEntities() {
  for (const enemy of world.enemies) {
    if (enemy.dead) {
      if (lightVisible(enemy)) {
        ctx.fillStyle = "#291317";
        ctx.beginPath();
        ctx.ellipse(enemy.x, enemy.y, 18, 9, enemy.angle, 0, TAU);
        ctx.fill();
      }
      continue;
    }
    const visible = lightVisible(enemy);
    const silhouette = settings.enemySilhouettes && dist(enemy, player) < 360 && hasLineOfSight(enemy, player);
    if (!visible && !canHearEnemy(enemy) && !silhouette) continue;
    ctx.save();
    ctx.translate(enemy.x, enemy.y);
    ctx.rotate(enemy.angle);
    ctx.globalAlpha = visible ? 1 : silhouette ? 0.38 : 0.28;
    ctx.fillStyle = visible ? enemy.color : silhouette ? "#ef665f" : "#9a3b3f";
    ctx.beginPath();
    ctx.moveTo(17, 0);
    ctx.lineTo(-11, -10);
    ctx.lineTo(-7, 0);
    ctx.lineTo(-11, 10);
    ctx.closePath();
    ctx.fill();
    if (enemy.alert > 0.5) {
      ctx.strokeStyle = "rgba(239,102,95,0.85)";
      ctx.beginPath();
      ctx.arc(0, 0, enemy.radius + 5, 0, TAU);
      ctx.stroke();
    }
    ctx.restore();
    ctx.globalAlpha = 1;
  }

  ctx.save();
  ctx.translate(player.x, player.y);
  ctx.rotate(player.angle + player.recoil * 0.12);
  ctx.fillStyle = player.invulnerable > 0 ? "#ffffff" : "#dbe8e5";
  ctx.beginPath();
  ctx.moveTo(18, 0);
  ctx.lineTo(-12, -11);
  ctx.lineTo(-5, 0);
  ctx.lineTo(-12, 11);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#202728";
  ctx.fillRect(4, -3, 22, 6);
  ctx.restore();

  for (const bullet of world.bullets) {
    ctx.strokeStyle = bullet.fromPlayer ? "rgba(255,238,166,0.8)" : "rgba(239,102,95,0.72)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(bullet.x, bullet.y);
    ctx.lineTo(bullet.x - bullet.vx * 0.025, bullet.y - bullet.vy * 0.025);
    ctx.stroke();
  }
}

function drawDarkness() {
  ctx.save();
  ctx.globalCompositeOperation = "source-over";
  let darknessAlpha = 0.98 - settings.brightness * 0.0022 - settings.gamma * 0.00115 - settings.ambientStrength * 0.0016;
  darknessAlpha += settings.fogDensity * 0.00085;
  if (settings.reducedShadowOpacity) darknessAlpha -= 0.12;
  ctx.fillStyle = `rgba(0,0,0,${clamp(darknessAlpha, 0.2, 0.94)})`;
  ctx.fillRect(camera.x, camera.y, window.innerWidth, window.innerHeight);
  ctx.globalCompositeOperation = "destination-out";

  const nearAlpha = clamp(0.68 + brightnessScale() * 0.18 + gammaScale() * 0.08, 0.68, 1);
  radialLight(player.x, player.y, nearVisibilityRadius(), nearAlpha);
  coneLight(
    player.x,
    player.y,
    player.angle,
    (player.focus ? 530 : 405) * flashlightReach() * (0.88 + flashlightPower() * 0.22),
    (player.focus ? 0.38 : 0.58) * beamSpread()
  );

  for (const light of world.lights) {
    if (!light.active) continue;
    const flicker = light.flicker ? 0.72 + Math.sin(light.phase) * 0.22 + Math.random() * 0.12 : 1;
    const interior = 0.72 + ambientScale() * 0.46 + brightnessScale() * 0.16;
    radialLight(light.x, light.y, light.radius * flicker * interior, 0.56 + ambientScale() * 0.22);
  }
  for (const p of world.particles) {
    if (p.light) radialLight(p.x, p.y, p.light * (0.82 + bloomScale() * 0.5), clamp(p.life / p.maxLife, 0, 1));
  }
  if (world.alarm > 0) {
    for (const light of world.lights.filter((_, i) => i % 3 === 0)) radialLight(light.x, light.y, (90 + Math.sin(performance.now() / 120) * 40) * (0.8 + bloomScale() * 0.45), 0.4);
  }
  ctx.restore();

  ctx.save();
  ctx.globalCompositeOperation = "source-over";
  const wallShadow = settings.reducedShadowOpacity ? 0.09 : settings.shadowQuality === "low" ? 0.12 : settings.shadowQuality === "medium" ? 0.18 : 0.22;
  ctx.fillStyle = `rgba(0,0,0,${wallShadow})`;
  for (const wall of world.walls) {
    ctx.fillRect(wall.x, wall.y, wall.w, wall.h);
  }
  ctx.restore();
}

function radialLight(x, y, radius, alpha) {
  const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
  const bloom = 0.86 + bloomScale() * 0.35;
  gradient.addColorStop(0, `rgba(255,255,255,${clamp(alpha * bloom, 0, 1)})`);
  gradient.addColorStop(0.55, `rgba(255,255,255,${clamp(alpha * 0.42 * bloom, 0, 1)})`);
  gradient.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, TAU);
  ctx.fill();
}

function coneLight(x, y, angle, range, spread) {
  const gradient = ctx.createRadialGradient(x, y, 18, x, y, range);
  const strength = clamp(0.72 + flashlightPower() * 0.28 + bloomScale() * 0.12, 0.55, 1);
  gradient.addColorStop(0, `rgba(255,255,255,${strength})`);
  gradient.addColorStop(0.68, `rgba(255,255,255,${strength * 0.36})`);
  gradient.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.arc(x, y, range, angle - spread, angle + spread);
  ctx.closePath();
  ctx.fill();
}

function drawForegroundEffects() {
  for (const p of world.particles) {
    const a = clamp(p.life / p.maxLife, 0, 1);
    ctx.globalAlpha = a;
    ctx.strokeStyle = p.color;
    ctx.fillStyle = p.color;
    if (p.ring) {
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * (1 - a), 0, TAU);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, TAU);
      ctx.fill();
    }
  }
  ctx.globalAlpha = 1;

  for (const ping of world.soundPings) {
    const a = ping.life / ping.maxLife;
    ctx.globalAlpha = a * 0.45;
    ctx.strokeStyle = ping.label === "sensor" ? "#73f4d6" : "#b8ece1";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(ping.x, ping.y, ping.radius * (1 - a), 0, TAU);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

function drawScreenEffects(w, h) {
  const sceneLift = clamp(settings.brightness * 0.00055 + (settings.gamma - 100) * 0.0011 + settings.ambientStrength * 0.00045, 0.02, 0.26);
  ctx.fillStyle = `rgba(125,165,158,${sceneLift})`;
  ctx.fillRect(0, 0, w, h);
  const gammaLift = clamp((gammaScale() - 1) * 0.12 + ambientScale() * 0.04, 0, 0.18);
  if (gammaLift > 0) {
    ctx.fillStyle = `rgba(160,190,185,${gammaLift})`;
    ctx.fillRect(0, 0, w, h);
  }
  const fog = clamp(settings.fogDensity / 100, 0, 1);
  if (fog > 0.02) {
    const fogAlpha = fog * clamp(0.12 - ambientScale() * 0.05 - (brightnessScale() - 1) * 0.05, 0.015, 0.14);
    ctx.fillStyle = `rgba(3,6,7,${fogAlpha})`;
    ctx.fillRect(0, 0, w, h);
  }
  const injury = 1 - player.health / 100;
  if (injury > 0.05) {
    ctx.fillStyle = `rgba(110,12,18,${injury * 0.42})`;
    ctx.fillRect(0, 0, w, h);
  }
  if (player.battery < 16) {
    const lowBatteryShadow = settings.reducedShadowOpacity ? 72 : 44;
    ctx.fillStyle = `rgba(0,0,0,${(16 - player.battery) / lowBatteryShadow})`;
    ctx.fillRect(0, 0, w, h);
  }
  if (extractionMessageTimer > 0 || player.health <= 0) {
    ctx.fillStyle = "rgba(0,0,0,0.66)";
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#e8fffb";
    ctx.textAlign = "center";
    ctx.font = "700 42px Segoe UI, Arial";
    ctx.fillText(player.health <= 0 ? "SIGNAL LOST" : "EXTRACTED", w / 2, h / 2);
    ctx.font = "15px Segoe UI, Arial";
    ctx.fillStyle = "#9fb4b1";
    ctx.fillText(player.health <= 0 ? "Refresh to retry the operation." : "Blacksite evidence secured. Persistent consequences recorded.", w / 2, h / 2 + 34);
    if (player.health <= 0) paused = true;
  }
}

function applyCanvasFilter() {
  const brightness = clamp(0.62 + brightnessScale() * 0.38 + (gammaScale() - 1) * 0.12, 0.45, 1.55);
  const contrast = clamp(settings.contrast / 100, 0.6, 1.6);
  canvas.style.filter = `brightness(${brightness}) contrast(${contrast})`;
}

function updateUI() {
  applyCanvasFilter();
  ui.healthText.textContent = Math.max(0, Math.round(player.health));
  ui.healthBar.style.width = `${clamp(player.health, 0, 100)}%`;
  ui.batteryText.textContent = Math.round(player.battery);
  ui.batteryBar.style.width = `${clamp(player.battery, 0, 100)}%`;
  ui.noiseText.textContent = player.noise > 70 ? "loud" : player.noise > 35 ? "audible" : "low";
  ui.noiseBar.style.width = `${clamp(player.noise, 0, 100)}%`;
  ui.ammoText.textContent = player.reload > 0 ? "RELOAD" : `${player.ammo} / ${player.reserve}`;

  const tasks = [];
  if (!world.objectives.card) tasks.push("find access card");
  if (!world.objectives.power) tasks.push("restore auxiliary power");
  if (world.objectives.intel < 3) tasks.push(`recover intel ${world.objectives.intel}/3`);
  tasks.push("reach east extraction");
  ui.objectiveText.textContent = player.extracted ? "Extraction complete." : `Objective: ${tasks.join(" / ")}`;

  renderEquipment();
}

function renderEquipment() {
  ui.equipmentList.innerHTML = equipmentNames.map(([name, get]) => `<li><span>${name}</span><b>${get()}</b></li>`).join("");
}

function renderBinds() {
  ui.bindList.innerHTML = "";
  Object.keys(defaultBinds).forEach(action => {
    const row = document.createElement("div");
    row.className = "bind-row";
    const label = document.createElement("span");
    label.textContent = bindLabels[action];
    const button = document.createElement("button");
    button.textContent = readableKey(binds[action]);
    button.addEventListener("click", () => {
      waitingForBind = action;
      button.textContent = "Press key";
    });
    row.append(label, button);
    ui.bindList.append(row);
  });
}

function closeAllPanels() {
  ui.inventory.classList.add("hidden");
  ui.settings.classList.add("hidden");
  paused = false;
}

function renderSettings() {
  ui.presetList.innerHTML = "";
  Object.keys(presets).forEach(name => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = name;
    button.addEventListener("click", () => applyPreset(name));
    ui.presetList.append(button);
  });

  ui.settingsList.innerHTML = "";
  settingControls.forEach(([key, label, help, min, max, step, suffix]) => {
    const row = document.createElement("div");
    row.className = "setting-row";
    const labelNode = document.createElement("label");
    labelNode.htmlFor = `setting-${key}`;
    labelNode.innerHTML = `${label}<small>${help}</small>`;
    const output = document.createElement("output");
    output.htmlFor = `setting-${key}`;
    output.textContent = `${settings[key]}${suffix}`;
    const input = document.createElement("input");
    input.id = `setting-${key}`;
    input.type = "range";
    input.min = min;
    input.max = max;
    input.step = step;
    input.value = settings[key];
    input.addEventListener("input", () => {
      settings[key] = Number(input.value);
      output.textContent = `${settings[key]}${suffix}`;
      saveSettings();
    });
    row.append(labelNode, output, input);
    ui.settingsList.append(row);
  });

  const shadowRow = document.createElement("div");
  shadowRow.className = "setting-row";
  const shadowLabel = document.createElement("label");
  shadowLabel.htmlFor = "setting-shadowQuality";
  shadowLabel.innerHTML = "Shadow Quality<small>Changes extra wall-shadow density and lighting cost.</small>";
  const shadowOutput = document.createElement("output");
  shadowOutput.textContent = settings.shadowQuality;
  const select = document.createElement("select");
  select.id = "setting-shadowQuality";
  ["low", "medium", "high"].forEach(value => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value;
    option.selected = settings.shadowQuality === value;
    select.append(option);
  });
  select.addEventListener("change", () => {
    settings.shadowQuality = select.value;
    shadowOutput.textContent = settings.shadowQuality;
    saveSettings();
  });
  shadowRow.append(shadowLabel, shadowOutput, select);
  ui.settingsList.append(shadowRow);

  ui.assistList.innerHTML = "";
  assistControls.forEach(([key, label]) => {
    const row = document.createElement("div");
    row.className = "toggle-row";
    const labelNode = document.createElement("label");
    labelNode.htmlFor = `assist-${key}`;
    labelNode.textContent = label;
    const input = document.createElement("input");
    input.id = `assist-${key}`;
    input.type = "checkbox";
    input.checked = Boolean(settings[key]);
    input.addEventListener("change", () => {
      settings[key] = input.checked;
      saveSettings();
    });
    row.append(labelNode, input);
    ui.assistList.append(row);
  });
}

function applyPreset(name) {
  Object.assign(settings, presets[name]);
  saveSettings();
  renderSettings();
  addRadio(`${name} lighting preset applied.`);
}

function saveSettings() {
  localStorage.setItem("blacksite-lighting-settings", JSON.stringify(settings));
  applyCanvasFilter();
}

function readableKey(code) {
  return (code || "Unbound").replace("Key", "").replace("Digit", "").replace("Left", "").replace("Right", "");
}

function loop(now) {
  const dt = Math.min(0.033, (now - lastTime) / 1000 || 0);
  lastTime = now;
  update(dt);
  draw();
}

function openInventory() {
  ui.inventory.classList.remove("hidden");
  ui.settings.classList.add("hidden");
  paused = true;
  renderBinds();
  renderEquipment();
}

function closeInventory() {
  ui.inventory.classList.add("hidden");
  paused = false;
}

function openSettings() {
  ui.settings.classList.remove("hidden");
  ui.inventory.classList.add("hidden");
  paused = true;
  renderSettings();
}

function closeSettings() {
  ui.settings.classList.add("hidden");
  paused = false;
}

window.addEventListener("resize", resize);
window.addEventListener("mousemove", event => {
  const rect = canvas.getBoundingClientRect();
  mouse.x = event.clientX - rect.left;
  mouse.y = event.clientY - rect.top;
  mouse.worldX = mouse.x + camera.x;
  mouse.worldY = mouse.y + camera.y;
});
window.addEventListener("mousedown", event => {
  if (!running) return;
  if (event.button === 0) mouse.down = true;
  if (event.button === 2) mouse.right = true;
});
window.addEventListener("mouseup", event => {
  if (event.button === 0) mouse.down = false;
  if (event.button === 2) mouse.right = false;
});
window.addEventListener("contextmenu", event => event.preventDefault());
window.addEventListener("keydown", event => {
  if (waitingForBind) {
    event.preventDefault();
    const duplicate = Object.entries(binds).find(([action, code]) => action !== waitingForBind && code === event.code);
    if (duplicate) binds[duplicate[0]] = "";
    binds[waitingForBind] = event.code;
    localStorage.setItem("blacksite-binds", JSON.stringify(binds));
    waitingForBind = null;
    renderBinds();
    return;
  }
  if (event.code === binds.inventory) {
    event.preventDefault();
    ui.inventory.classList.contains("hidden") ? openInventory() : closeInventory();
    return;
  }
  if (event.code === binds.settings) {
    event.preventDefault();
    ui.settings.classList.contains("hidden") ? openSettings() : closeSettings();
    return;
  }
  if (event.code === "Escape" && (!ui.inventory.classList.contains("hidden") || !ui.settings.classList.contains("hidden"))) {
    event.preventDefault();
    closeAllPanels();
    return;
  }
  keys.add(event.code);
  if (paused) return;
  if (event.code === binds.reload) reload();
  if (event.code === binds.interact) interact();
  if (event.code === binds.utility) useUtility();
  if (event.code === binds.gadget) useGadget();
  if (event.code === binds.dodge) dodge();
});
window.addEventListener("keyup", event => keys.delete(event.code));

ui.startButton.addEventListener("click", () => {
  ui.start.classList.add("hidden");
  running = true;
  paused = false;
  addRadio("Entry team one, you are alone. Find a way out.");
});
ui.closeInventory.addEventListener("click", closeInventory);
ui.openSettings.addEventListener("click", openSettings);
ui.closeSettings.addEventListener("click", closeSettings);

resize();
makeWorld();
renderBinds();
renderEquipment();
updateCamera();
updateUI();
requestAnimationFrame(loop);
