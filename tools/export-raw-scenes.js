"use strict";

const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

const ROOT = path.resolve(__dirname, "..");
const OUTPUT_DIR = path.join(ROOT, "raw-scene");
const DEFAULT_WORLD = { w: 960, h: 640 };
const SAFE_PADDING = 56;

const COLORS = {
  outside: "#101315",
  floor: "#1a1f1f",
  floorAlt: "#202626",
  room: "#242b2d",
  grid: "#253033",
  wall: "#596369",
  wallEdge: "#2a3033",
  doorClosed: "#e0af56",
  doorOpen: "#70c58d",
  doorLocked: "#e25f5f",
  doorUnlocked: "#72b7ce",
  window: "#b9e8f3",
  stair: "#8ec6c0",
  gear: "#6b6f75",
  laptop: "#202a31",
  paper: "#f5e6a6",
  operator: "#68c98f",
  operator2: "#72b7ce",
  enemy: "#df6262",
  objective: "#ebd36b",
  camera: "#72b7ce",
  text: "#eef3ef",
  muted: "#98a29b",
  black: "#101214"
};

const FONT = {
  "A": ["01110", "10001", "10001", "11111", "10001", "10001", "10001"],
  "B": ["11110", "10001", "10001", "11110", "10001", "10001", "11110"],
  "C": ["01111", "10000", "10000", "10000", "10000", "10000", "01111"],
  "D": ["11110", "10001", "10001", "10001", "10001", "10001", "11110"],
  "E": ["11111", "10000", "10000", "11110", "10000", "10000", "11111"],
  "F": ["11111", "10000", "10000", "11110", "10000", "10000", "10000"],
  "G": ["01111", "10000", "10000", "10111", "10001", "10001", "01110"],
  "H": ["10001", "10001", "10001", "11111", "10001", "10001", "10001"],
  "I": ["11111", "00100", "00100", "00100", "00100", "00100", "11111"],
  "J": ["00111", "00010", "00010", "00010", "10010", "10010", "01100"],
  "K": ["10001", "10010", "10100", "11000", "10100", "10010", "10001"],
  "L": ["10000", "10000", "10000", "10000", "10000", "10000", "11111"],
  "M": ["10001", "11011", "10101", "10101", "10001", "10001", "10001"],
  "N": ["10001", "11001", "10101", "10011", "10001", "10001", "10001"],
  "O": ["01110", "10001", "10001", "10001", "10001", "10001", "01110"],
  "P": ["11110", "10001", "10001", "11110", "10000", "10000", "10000"],
  "Q": ["01110", "10001", "10001", "10001", "10101", "10010", "01101"],
  "R": ["11110", "10001", "10001", "11110", "10100", "10010", "10001"],
  "S": ["01111", "10000", "10000", "01110", "00001", "00001", "11110"],
  "T": ["11111", "00100", "00100", "00100", "00100", "00100", "00100"],
  "U": ["10001", "10001", "10001", "10001", "10001", "10001", "01110"],
  "V": ["10001", "10001", "10001", "10001", "10001", "01010", "00100"],
  "W": ["10001", "10001", "10001", "10101", "10101", "10101", "01010"],
  "X": ["10001", "10001", "01010", "00100", "01010", "10001", "10001"],
  "Y": ["10001", "10001", "01010", "00100", "00100", "00100", "00100"],
  "Z": ["11111", "00001", "00010", "00100", "01000", "10000", "11111"],
  "0": ["01110", "10001", "10011", "10101", "11001", "10001", "01110"],
  "1": ["00100", "01100", "00100", "00100", "00100", "00100", "01110"],
  "2": ["01110", "10001", "00001", "00010", "00100", "01000", "11111"],
  "3": ["11110", "00001", "00001", "01110", "00001", "00001", "11110"],
  "4": ["00010", "00110", "01010", "10010", "11111", "00010", "00010"],
  "5": ["11111", "10000", "10000", "11110", "00001", "00001", "11110"],
  "6": ["01110", "10000", "10000", "11110", "10001", "10001", "01110"],
  "7": ["11111", "00001", "00010", "00100", "01000", "01000", "01000"],
  "8": ["01110", "10001", "10001", "01110", "10001", "10001", "01110"],
  "9": ["01110", "10001", "10001", "01111", "00001", "00001", "01110"],
  "-": ["00000", "00000", "00000", "11111", "00000", "00000", "00000"],
  "/": ["00001", "00001", "00010", "00100", "01000", "10000", "10000"],
  ":": ["00000", "00100", "00100", "00000", "00100", "00100", "00000"],
  ".": ["00000", "00000", "00000", "00000", "00000", "01100", "01100"],
  " ": ["00000", "00000", "00000", "00000", "00000", "00000", "00000"]
};

function main() {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  const inputs = [
    ...readJsonFiles("level").map((file) => ({ kind: "level", file })),
    ...readJsonFiles("tutorials").map((file) => ({ kind: "tutorial", file }))
  ];
  const written = [];
  for (const input of inputs) {
    const level = JSON.parse(fs.readFileSync(input.file, "utf8"));
    const image = renderLevel(level);
    const name = `${input.kind}-${slug(level.id || path.basename(input.file, ".json"))}.png`;
    const outFile = path.join(OUTPUT_DIR, name);
    fs.writeFileSync(outFile, encodePng(image.width, image.height, image.pixels));
    written.push(path.relative(ROOT, outFile));
  }
  console.log(`Exported ${written.length} raw scene PNGs to ${path.relative(ROOT, OUTPUT_DIR)}:`);
  for (const file of written) console.log(`- ${file}`);
}

function readJsonFiles(folder) {
  const dir = path.join(ROOT, folder);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter((file) => file.toLowerCase().endsWith(".json"))
    .sort()
    .map((file) => path.join(dir, file));
}

function renderLevel(level) {
  const bounds = level.width && level.height
    ? { minX: 0, minY: 0, maxX: level.width, maxY: level.height, explicit: true }
    : computedBounds(level);
  const width = Math.max(1, Math.ceil(bounds.maxX - bounds.minX));
  const height = Math.max(1, Math.ceil(bounds.maxY - bounds.minY));
  const canvas = createCanvas(width, height);
  const tx = -bounds.minX;
  const ty = -bounds.minY;
  const draw = withOffset(canvas, tx, ty);

  canvas.fillRect(0, 0, width, height, COLORS.outside);
  draw.fillRect(bounds.minX, bounds.minY, width, height, COLORS.floor);
  drawGrid(draw, bounds);

  for (const zone of level.floorZones || []) draw.fillRect(zone.x, zone.y, zone.w, zone.h, COLORS.floorAlt);
  for (const room of level.rooms || []) {
    draw.fillRect(room.x, room.y, room.w, room.h, COLORS.room);
    draw.strokeRect(room.x, room.y, room.w, room.h, "#344044", 2);
    draw.centerText(room.label || room.id || "ROOM", room.x + room.w / 2, room.y + 18, COLORS.muted, 2);
  }
  for (const wall of level.walls || []) {
    draw.fillRect(wall.x, wall.y, wall.w, wall.h, COLORS.wall);
    draw.strokeRect(wall.x, wall.y, wall.w, wall.h, COLORS.wallEdge, 2);
  }
  for (const win of level.windows || []) drawRectObject(draw, win, windowColor(win), "WIN");
  for (const stair of level.stairs || []) drawRectObject(draw, stair, COLORS.stair, stair.label || "STAIR");
  for (const table of level.equipmentTables || []) drawRectObject(draw, table, COLORS.gear, "GEAR");
  for (const laptop of level.laptops || []) drawRectObject(draw, laptop, COLORS.laptop, "LAP");
  for (const item of level.items || []) drawRectObject(draw, { ...item, w: item.w || 20, h: item.h || 16 }, COLORS.paper, item.type === "paper" ? "PAPER" : "ITEM");
  for (const door of level.doors || []) drawDoor(draw, door);
  for (const camera of level.cameras || []) drawCircleLabel(draw, camera.x, camera.y, 13, COLORS.camera, camera.label || camera.id || "C");
  if (level.objective) drawCircleLabel(draw, level.objective.x, level.objective.y, level.objective.radius || 16, COLORS.objective, "VIP");
  for (const op of level.operators || []) drawUnit(draw, op, op.color || COLORS.operator, op.id || "OP", op.aim || 0);
  for (const enemy of level.enemies || []) drawUnit(draw, enemy, COLORS.enemy, enemy.id || "E", enemy.angle || 0);
  for (const label of level.labels || []) draw.centerText(label.text || "", label.x, label.y, COLORS.text, 2);
  draw.centerText(level.title || level.id || "LEVEL", bounds.minX + width / 2, bounds.minY + 22, COLORS.text, 2);

  return canvas;
}

function computedBounds(level) {
  const boxes = [];
  const points = [];
  const rectKeys = ["floorZones", "rooms", "walls", "doors", "windows", "stairs", "equipmentTables", "laptops", "items"];
  for (const key of rectKeys) {
    for (const obj of level[key] || []) boxes.push({ x: obj.x, y: obj.y, w: obj.w || 24, h: obj.h || 20 });
  }
  for (const op of level.operators || []) points.push({ x: op.x, y: op.y, r: 24 });
  for (const enemy of level.enemies || []) points.push({ x: enemy.x, y: enemy.y, r: 24 });
  for (const camera of level.cameras || []) points.push({ x: camera.x, y: camera.y, r: 18 });
  for (const label of level.labels || []) points.push({ x: label.x, y: label.y, r: 80 });
  if (level.objective) points.push({ x: level.objective.x, y: level.objective.y, r: level.objective.radius || 24 });
  for (const box of boxes) {
    points.push({ x: box.x, y: box.y, r: 0 });
    points.push({ x: box.x + box.w, y: box.y + box.h, r: 0 });
  }
  if (!points.length) {
    return { minX: 0, minY: 0, maxX: DEFAULT_WORLD.w, maxY: DEFAULT_WORLD.h, explicit: false };
  }
  return {
    minX: Math.floor(Math.min(...points.map((point) => point.x - point.r)) - SAFE_PADDING),
    minY: Math.floor(Math.min(...points.map((point) => point.y - point.r)) - SAFE_PADDING),
    maxX: Math.ceil(Math.max(...points.map((point) => point.x + point.r)) + SAFE_PADDING),
    maxY: Math.ceil(Math.max(...points.map((point) => point.y + point.r)) + SAFE_PADDING),
    explicit: false
  };
}

function drawGrid(draw, bounds) {
  const startX = Math.floor(bounds.minX / 40) * 40;
  const startY = Math.floor(bounds.minY / 40) * 40;
  for (let x = startX; x <= bounds.maxX; x += 40) draw.line(x, bounds.minY, x, bounds.maxY, COLORS.grid);
  for (let y = startY; y <= bounds.maxY; y += 40) draw.line(bounds.minX, y, bounds.maxX, y, COLORS.grid);
}

function drawRectObject(draw, obj, color, label) {
  draw.fillRect(obj.x, obj.y, obj.w || 24, obj.h || 20, color);
  draw.strokeRect(obj.x, obj.y, obj.w || 24, obj.h || 20, COLORS.black, 2);
  draw.centerText(label, obj.x + (obj.w || 24) / 2, obj.y + (obj.h || 20) / 2 - 4, COLORS.black, 1);
}

function drawDoor(draw, door) {
  const color = door.state === "open" ? COLORS.doorOpen : COLORS.doorClosed;
  draw.fillRect(door.x, door.y, door.w, door.h, color);
  draw.strokeRect(door.x, door.y, door.w, door.h, COLORS.black, 2);
  if (door.lockType === "digital") {
    const label = door.locked === false ? "U" : "L";
    const marker = door.locked === false ? COLORS.doorUnlocked : COLORS.doorLocked;
    drawCircleLabel(draw, door.x + door.w / 2, door.y + door.h / 2, 10, marker, label);
  }
}

function drawUnit(draw, unit, color, label, angle) {
  const radius = unit.radius || 12;
  draw.circle(unit.x, unit.y, radius, color);
  draw.circleStroke(unit.x, unit.y, radius, COLORS.black, 2);
  draw.line(unit.x, unit.y, unit.x + Math.cos(angle) * (radius + 10), unit.y + Math.sin(angle) * (radius + 10), COLORS.black, 3);
  draw.centerText(label, unit.x, unit.y - radius - 16, COLORS.text, 1);
}

function drawCircleLabel(draw, x, y, radius, color, label) {
  draw.circle(x, y, radius, color);
  draw.circleStroke(x, y, radius, COLORS.black, 2);
  draw.centerText(label, x, y - 4, COLORS.black, 1);
}

function windowColor(win) {
  if (win.state === "broken") return "#92d5e9";
  if (win.state === "open") return COLORS.doorUnlocked;
  return COLORS.window;
}

function createCanvas(width, height) {
  const pixels = Buffer.alloc(width * height * 4);
  return {
    width,
    height,
    pixels,
    fillRect(x, y, w, h, color) {
      const rgba = parseColor(color);
      const x0 = clamp(Math.floor(x), 0, width);
      const y0 = clamp(Math.floor(y), 0, height);
      const x1 = clamp(Math.ceil(x + w), 0, width);
      const y1 = clamp(Math.ceil(y + h), 0, height);
      for (let yy = y0; yy < y1; yy++) {
        for (let xx = x0; xx < x1; xx++) setPixel(pixels, width, xx, yy, rgba);
      }
    },
    strokeRect(x, y, w, h, color, lineWidth = 1) {
      this.fillRect(x, y, w, lineWidth, color);
      this.fillRect(x, y + h - lineWidth, w, lineWidth, color);
      this.fillRect(x, y, lineWidth, h, color);
      this.fillRect(x + w - lineWidth, y, lineWidth, h, color);
    },
    line(x0, y0, x1, y1, color, lineWidth = 1) {
      const rgba = parseColor(color);
      const steps = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1);
      for (let i = 0; i <= steps; i++) {
        const x = x0 + (x1 - x0) * (i / steps);
        const y = y0 + (y1 - y0) * (i / steps);
        this.fillRect(Math.round(x - lineWidth / 2), Math.round(y - lineWidth / 2), lineWidth, lineWidth, rgba);
      }
    },
    circle(cx, cy, radius, color) {
      const rgba = parseColor(color);
      const r2 = radius * radius;
      for (let y = Math.floor(cy - radius); y <= Math.ceil(cy + radius); y++) {
        for (let x = Math.floor(cx - radius); x <= Math.ceil(cx + radius); x++) {
          if ((x - cx) * (x - cx) + (y - cy) * (y - cy) <= r2) {
            if (x >= 0 && x < width && y >= 0 && y < height) setPixel(pixels, width, x, y, rgba);
          }
        }
      }
    },
    circleStroke(cx, cy, radius, color, lineWidth = 1) {
      const rgba = parseColor(color);
      const inner = (radius - lineWidth) * (radius - lineWidth);
      const outer = radius * radius;
      for (let y = Math.floor(cy - radius); y <= Math.ceil(cy + radius); y++) {
        for (let x = Math.floor(cx - radius); x <= Math.ceil(cx + radius); x++) {
          const d = (x - cx) * (x - cx) + (y - cy) * (y - cy);
          if (d >= inner && d <= outer && x >= 0 && x < width && y >= 0 && y < height) {
            setPixel(pixels, width, x, y, rgba);
          }
        }
      }
    },
    text(text, x, y, color, scale = 1) {
      drawText(this, text, x, y, color, scale);
    },
    centerText(text, cx, y, color, scale = 1) {
      const content = String(text || "").toUpperCase();
      const w = textWidth(content, scale);
      drawText(this, content, cx - w / 2, y, color, scale);
    }
  };
}

function withOffset(canvas, tx, ty) {
  return {
    fillRect: (x, y, w, h, color) => canvas.fillRect(x + tx, y + ty, w, h, color),
    strokeRect: (x, y, w, h, color, lineWidth) => canvas.strokeRect(x + tx, y + ty, w, h, color, lineWidth),
    line: (x0, y0, x1, y1, color, lineWidth) => canvas.line(x0 + tx, y0 + ty, x1 + tx, y1 + ty, color, lineWidth),
    circle: (x, y, radius, color) => canvas.circle(x + tx, y + ty, radius, color),
    circleStroke: (x, y, radius, color, lineWidth) => canvas.circleStroke(x + tx, y + ty, radius, color, lineWidth),
    text: (text, x, y, color, scale) => canvas.text(text, x + tx, y + ty, color, scale),
    centerText: (text, x, y, color, scale) => canvas.centerText(text, x + tx, y + ty, color, scale)
  };
}

function drawText(canvas, text, x, y, color, scale) {
  const rgba = parseColor(color);
  let cursor = Math.round(x);
  const top = Math.round(y);
  for (const char of String(text || "").toUpperCase()) {
    const glyph = FONT[char] || FONT[" "];
    for (let row = 0; row < glyph.length; row++) {
      for (let col = 0; col < glyph[row].length; col++) {
        if (glyph[row][col] === "1") canvas.fillRect(cursor + col * scale, top + row * scale, scale, scale, rgba);
      }
    }
    cursor += 6 * scale;
  }
}

function textWidth(text, scale) {
  return String(text || "").length * 6 * scale;
}

function parseColor(color) {
  if (Array.isArray(color)) return color;
  const value = String(color || "#000000").replace("#", "");
  return [
    parseInt(value.slice(0, 2), 16),
    parseInt(value.slice(2, 4), 16),
    parseInt(value.slice(4, 6), 16),
    255
  ];
}

function setPixel(pixels, width, x, y, rgba) {
  const index = (y * width + x) * 4;
  pixels[index] = rgba[0];
  pixels[index + 1] = rgba[1];
  pixels[index + 2] = rgba[2];
  pixels[index + 3] = rgba[3];
}

function encodePng(width, height, pixels) {
  const raw = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y++) {
    const srcStart = y * width * 4;
    const dstStart = y * (width * 4 + 1);
    raw[dstStart] = 0;
    pixels.copy(raw, dstStart + 1, srcStart, srcStart + width * 4);
  }
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk("IHDR", ihdr(width, height)),
    chunk("IDAT", zlib.deflateSync(raw)),
    chunk("IEND", Buffer.alloc(0))
  ]);
}

function ihdr(width, height) {
  const data = Buffer.alloc(13);
  data.writeUInt32BE(width, 0);
  data.writeUInt32BE(height, 4);
  data[8] = 8;
  data[9] = 6;
  data[10] = 0;
  data[11] = 0;
  data[12] = 0;
  return data;
}

function chunk(type, data) {
  const typeBuffer = Buffer.from(type);
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])), 0);
  return Buffer.concat([length, typeBuffer, data, crc]);
}

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc ^= byte;
    for (let i = 0; i < 8; i++) {
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function slug(value) {
  return String(value || "scene").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

main();
