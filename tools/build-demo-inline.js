"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const DEMO_DIR = path.join(ROOT, "demo");

function main() {
  const indexFile = path.join(ROOT, "index.html");
  let html = fs.readFileSync(indexFile, "utf8");
  html = html.replace(/<link rel="stylesheet" href="styles\.css(?:\?v=\d+)?">/, inlineStyle("styles.css"));
  html = html.replace(/<link rel="stylesheet" href="mobile\/mobile\.css(?:\?v=\d+)?">/, inlineStyle("mobile/mobile.css"));

  const scriptSources = [...html.matchAll(/<script src="([^"]+)"><\/script>/g)].map((match) => match[1].split("?")[0]);
  const externalScriptPattern = /    <script src="systems\/audio-system\.js(?:\?v=\d+)?"><\/script>[\s\S]*?    <script src="main\.js(?:\?v=\d+)?"><\/script>/;
  const inlineScripts = [
    demoDataScript(),
    ...scriptSources.map((source) => inlineScript(source))
  ].join("\n");
  html = html.replace(externalScriptPattern, inlineScripts);

  fs.mkdirSync(DEMO_DIR, { recursive: true });
  fs.writeFileSync(path.join(DEMO_DIR, "index.html"), html);
  console.log("Rebuilt demo/index.html as an inline standalone file.");
}

function inlineStyle(source) {
  let css = fs.readFileSync(path.join(ROOT, source), "utf8");
  if (source.startsWith("mobile/")) {
    css = css.replace(/\.\.\/docs\//g, "docs/");
  }
  return `<style>\n${css}\n</style>`;
}

function inlineScript(source) {
  let js = fs.readFileSync(path.join(ROOT, source), "utf8");
  js = js.replace(/\bfetch\(/g, "window.__demoDataRequest(");
  return `    <script data-inline-source="${source}">\n${js}\n    </script>`;
}

function demoDataScript() {
  const data = {
    levels: collectJson("level"),
    tutorials: collectJson("tutorials"),
    temp: collectOptionalJson("temp"),
    equipment: collectJson("equipment")
  };
  return `    <script data-inline-source="demo-data">\nwindow.DemoData = ${JSON.stringify(data)};\nwindow.__demoDataRequest = async function demoDataRequest(file) {\n  const key = String(file || \"\").replace(/^\\.\\//, \"\");\n  const stores = [window.DemoData.levels, window.DemoData.tutorials, window.DemoData.temp, window.DemoData.equipment];\n  for (const store of stores) {\n    if (store[key]) return demoResponse(store[key]);\n    const found = Object.values(store).find((item) => item && (item.id === key || item.file === key));\n    if (found) return demoResponse(found);\n  }\n  return { ok: false, status: 404, json: async function () { return null; } };\n};\nfunction demoResponse(data) {\n  return { ok: true, status: 200, json: async function () { return JSON.parse(JSON.stringify(data)); } };\n}\n    </script>`;
}

function collectJson(folder) {
  const dir = path.join(ROOT, folder);
  const result = {};
  for (const file of fs.readdirSync(dir).filter((name) => name.toLowerCase().endsWith(".json")).sort()) {
    const rel = `${folder}/${file}`;
    const data = JSON.parse(fs.readFileSync(path.join(dir, file), "utf8"));
    result[rel] = data;
    if (data.id) result[data.id] = data;
  }
  return result;
}

function collectOptionalJson(folder) {
  const dir = path.join(ROOT, folder);
  if (!fs.existsSync(dir)) return {};
  return collectJson(folder);
}

main();
