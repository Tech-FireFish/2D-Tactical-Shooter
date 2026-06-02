"use strict";

const canvas = document.getElementById("sceneBoard");
const ctx = canvas.getContext("2d");
const propertyPanel = document.getElementById("propertyPanel");
const state = {
  selectedResource: "wall",
  selectedId: null,
  level: {
    id: "custom-level",
    title: "Custom Level",
    width: canvas.width,
    height: canvas.height,
    floorZones: [],
    rooms: [],
    labels: [],
    walls: [],
    doors: [],
    windows: [],
    stairs: [],
    items: [],
    equipmentTables: [],
    operators: [],
    enemies: [],
    objective: { x: 980, y: 620, radius: 16, secured: false, harmed: false }
  }
};

const resourceDefaults = {
  wall: (x, y) => ({ type: "wall", x, y, w: 120, h: 20 }),
  door: (x, y) => ({ type: "door", id: nextId("door"), x, y, w: 90, h: 20, orientation: "horizontal", state: "closed", lockType: "" }),
  window: (x, y) => ({ type: "window", id: nextId("window"), x, y, w: 110, h: 20, orientation: "horizontal", state: "closed", damage: 8 }),
  label: (x, y) => ({ type: "label", text: "Room", x, y }),
  stairs: (x, y) => ({ type: "stairs", id: nextId("stairs"), name: "Stairs", label: "A", x, y, w: 90, h: 70, target: { x: x + 180, y, floor: "Floor 2", label: "B" } }),
  equipmentTable: (x, y) => ({ type: "equipmentTable", id: nextId("gear"), name: "Gear Table", x, y, w: 70, h: 50 }),
  paper: (x, y) => ({ type: "paper", id: nextId("paper"), name: "Code Paper", x, y, w: 24, h: 18, passwordFor: "door-1" }),
  operator: (x, y) => ({ type: "operator", id: nextOperatorId(), x, y, color: "#67c98f", floor: "Floor 1", zone: "Entry" }),
  enemy: (x, y) => ({ type: "enemy", id: nextId("E"), x, y, angle: 3.14159, watch: { x: x - 120, y } }),
  objective: (x, y) => ({ type: "objective", x, y, radius: 16, secured: false, harmed: false })
};

document.querySelectorAll("[data-resource]").forEach((button) => {
  button.addEventListener("click", () => {
    state.selectedResource = button.dataset.resource;
    document.querySelectorAll("[data-resource]").forEach((item) => item.classList.toggle("active", item === button));
  });
});

canvas.addEventListener("click", (event) => {
  const point = mousePoint(event);
  const hit = findAt(point);
  if (hit) {
    state.selectedId = hit._editorId;
    renderProperties(hit);
    draw();
    return;
  }
  const factory = resourceDefaults[state.selectedResource] || resourceDefaults.wall;
  const object = factory(Math.round(point.x / 10) * 10, Math.round(point.y / 10) * 10);
  addObject(object);
  state.selectedId = object._editorId;
  renderProperties(object);
  draw();
});

document.getElementById("downloadLevelButton").addEventListener("click", () => {
  const level = serializeLevel();
  const blob = new Blob([JSON.stringify(level, null, 2)], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${level.id || "custom-level"}.json`;
  link.click();
  URL.revokeObjectURL(link.href);
});

function nextId(prefix) {
  return `${prefix}-${Math.floor(Math.random() * 100000)}`;
}

function nextOperatorId() {
  const count = state.level.operators.length;
  return count === 0 ? "ALPHA" : count === 1 ? "BRAVO" : `OP${count + 1}`;
}

function mousePoint(event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: (event.clientX - rect.left) * (canvas.width / rect.width),
    y: (event.clientY - rect.top) * (canvas.height / rect.height)
  };
}

function addObject(object) {
  object._editorId = nextId("obj");
  if (object.type === "wall") state.level.walls.push(object);
  else if (object.type === "door") state.level.doors.push(object);
  else if (object.type === "window") state.level.windows.push(object);
  else if (object.type === "label") state.level.labels.push(object);
  else if (object.type === "stairs") state.level.stairs.push(object);
  else if (object.type === "equipmentTable") state.level.equipmentTables.push(object);
  else if (object.type === "paper") state.level.items.push(object);
  else if (object.type === "operator") state.level.operators.push(object);
  else if (object.type === "enemy") state.level.enemies.push(object);
  else if (object.type === "objective") state.level.objective = object;
}

function allObjects() {
  return [
    ...state.level.walls,
    ...state.level.doors,
    ...state.level.windows,
    ...state.level.labels,
    ...state.level.stairs,
    ...state.level.equipmentTables,
    ...state.level.items,
    ...state.level.operators,
    ...state.level.enemies,
    state.level.objective
  ].filter(Boolean);
}

function findAt(point) {
  return allObjects().slice().reverse().find((object) => {
    if (object.radius) return Math.hypot(point.x - object.x, point.y - object.y) <= object.radius + 8;
    const w = object.w || 70;
    const h = object.h || 28;
    return point.x >= object.x && point.x <= object.x + w && point.y >= object.y && point.y <= object.y + h;
  });
}

function renderProperties(object) {
  if (!object) {
    propertyPanel.textContent = "Select or place an object.";
    return;
  }
  const fields = Object.entries(object)
    .filter(([key]) => key !== "_editorId" && key !== "type" && typeof object[key] !== "object")
    .map(([key, value]) => `
      <label class="field">
        <span>${key}</span>
        <input data-prop="${key}" value="${String(value)}">
      </label>
    `).join("");
  const digital = object.type === "door" ? `
    <label class="field">
      <span>Digital Lock</span>
      <select data-prop="lockType">
        <option value=""${object.lockType ? "" : " selected"}>None</option>
        <option value="digital"${object.lockType === "digital" ? " selected" : ""}>Digital</option>
      </select>
    </label>
  ` : "";
  const target = object.type === "stairs" ? `
    <label class="field"><span>Target X</span><input data-target-prop="x" value="${object.target.x}"></label>
    <label class="field"><span>Target Y</span><input data-target-prop="y" value="${object.target.y}"></label>
  ` : "";
  propertyPanel.innerHTML = `<strong>${object.type}</strong>${fields}${digital}${target}`;
  propertyPanel.querySelectorAll("input[data-prop], select[data-prop]").forEach((input) => {
    input.addEventListener("input", () => {
      object[input.dataset.prop] = parseValue(input.value);
      draw();
    });
  });
  propertyPanel.querySelectorAll("input[data-target-prop]").forEach((input) => {
    input.addEventListener("input", () => {
      object.target[input.dataset.targetProp] = parseValue(input.value);
      draw();
    });
  });
}

function parseValue(value) {
  const numeric = Number(value);
  return Number.isFinite(numeric) && value.trim() !== "" ? numeric : value;
}

function serializeLevel() {
  const clean = JSON.parse(JSON.stringify(state.level));
  const strip = (item) => {
    delete item._editorId;
    delete item.type;
    if (item.lockType === "") delete item.lockType;
    return item;
  };
  clean.walls = clean.walls.map(strip);
  clean.doors = clean.doors.map((door) => {
    strip(door);
    if (door.lockType === "digital") {
      door.locked = true;
      door.password = "0000";
    }
    return door;
  });
  clean.windows = clean.windows.map(strip);
  clean.labels = clean.labels.map(strip);
  clean.stairs = clean.stairs.map(strip);
  clean.equipmentTables = clean.equipmentTables.map(strip);
  clean.items = clean.items.map(strip);
  clean.operators = clean.operators.map(strip);
  clean.enemies = clean.enemies.map(strip);
  strip(clean.objective);
  return clean;
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#15191b";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = "rgba(255,255,255,0.045)";
  for (let x = 0; x < canvas.width; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }
  for (let y = 0; y < canvas.height; y += 40) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }
  drawRects(state.level.walls, "#596369");
  drawRects(state.level.doors, "#e3b456");
  drawRects(state.level.windows, "#72b7ce");
  drawRects(state.level.stairs, "#8ec6c0");
  drawRects(state.level.equipmentTables, "#6b6f75");
  drawRects(state.level.items, "#f5e6a6");
  drawLabels();
  drawUnits();
}

function drawRects(list, fill) {
  for (const object of list) {
    ctx.fillStyle = fill;
    ctx.strokeStyle = object._editorId === state.selectedId ? "#ffffff" : "#222";
    ctx.lineWidth = object._editorId === state.selectedId ? 3 : 1;
    ctx.fillRect(object.x, object.y, object.w || 24, object.h || 18);
    ctx.strokeRect(object.x, object.y, object.w || 24, object.h || 18);
  }
}

function drawLabels() {
  ctx.fillStyle = "#eef3ef";
  ctx.font = "800 13px system-ui";
  ctx.textAlign = "center";
  for (const label of state.level.labels) {
    ctx.fillText(label.text || "Room", label.x, label.y);
  }
}

function drawUnits() {
  for (const op of state.level.operators) drawCircle(op, op.color || "#67c98f", op.id);
  for (const enemy of state.level.enemies) drawCircle(enemy, "#df6262", enemy.id);
  drawCircle(state.level.objective, "#ebd36b", "VIP");
}

function drawCircle(object, fill, label) {
  ctx.fillStyle = fill;
  ctx.strokeStyle = object._editorId === state.selectedId ? "#ffffff" : "#111";
  ctx.lineWidth = object._editorId === state.selectedId ? 3 : 1;
  ctx.beginPath();
  ctx.arc(object.x, object.y, object.radius || 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#eef3ef";
  ctx.font = "800 10px system-ui";
  ctx.textAlign = "center";
  ctx.fillText(label || object.type, object.x, object.y - 18);
}

document.querySelector("[data-resource='wall']").classList.add("active");
draw();
