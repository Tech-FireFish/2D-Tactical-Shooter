# BLACKSITE EGRESS

A dark tactical 2D top-down shooter prototype built with plain HTML, CSS, and JavaScript.

## Run

Open `index.html` directly, or run the included local server:

```powershell
node server.js
```

Then visit `http://127.0.0.1:5173`.

## Controls

- `WASD`: move
- `Left Mouse`: shoot
- `Right Mouse`: aim / tactical focus
- `R`: reload
- `F`: interact
- `E`: quick utility / medkit
- `Q`: motion sensor
- `Shift`: sprint
- `Ctrl`: crouch
- `Tab`: inventory and key rebinding
- `Space`: dodge / vault

## Prototype Features

- Directional flashlight vision with near-total darkness outside visible range
- Environmental lights, flicker, power restoration, muzzle flash lighting, and alarm pulses
- Semi-open facility layout with locked sectors, notes, loot, card access, power objective, and extraction
- Realistic-ish weapon pacing with recoil, reload timing, penetration against doors, suppression, and limited ammo
- AI states for idle, investigate, and attack; enemies react to sound, line-of-sight, light, and sensor pings
- Resource management for ammo, battery, medkits, motion sensors, and breaching charges
- Full keyboard rebinding from the inventory panel
