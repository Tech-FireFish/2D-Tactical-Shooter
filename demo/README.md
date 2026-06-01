# Breachline 2D Demo Guide

This demo copy runs without Node.js, npm, or a localhost server. Open `index.html` directly in a browser to play.

The copied `level/` and `equipment/` folders are included for reference, but the demo loads gameplay data from `demo-data.js` so browser `file://` JSON restrictions do not block startup.

![Breachline 2D gameplay screenshot](docs/gameplay-screenshot.png)

## Gameplay

Breachline 2D is a top-down tactical breach game. You choose one or two operators, assign each operator a weapon, plan routes through the level, open doors manually with `E` or by clicking nearby doors, and let operators automatically engage enemies when they have clear line-of-sight. You can pause and replan at any time with `Space`.

The mission succeeds when the VIP/objective is secured or all hostiles are neutralized. The mission fails if all operators are down or the objective is compromised.

## How To Run

Open `index.html` directly from this `demo` folder.

## Why A Dev Server Is Needed

The root project uses a dev server because it loads JSON files with browser `fetch()` requests. This demo embeds those JSON files into `demo-data.js`, so it does not need a local HTTP server.

## Do You Need To Install Node?

No. This demo does not require Node.js, npm, or `npm start`. Use the root project only if you want the localhost development server.
