# HallowPeen LIVE: Spooky Neighborhood

Live page: https://hallowpeen.com/live/  (one canvas; `sim.js` + `sim.css`, no build step)

## URL options
| param | what it does |
|---|---|
| `?demo=1` | fake buys and sells every few seconds (rehearsal) |
| `?obs=1` | stream mode: only the 16:9 scene, transparent page, no cursor; host keys enabled |
| `?host=1` | host panel under the scene (command buttons + name queue) |
| `?sound=1` | sound on at load (OBS: tick "Control audio via OBS") |
| `?hud=0` | hide the in-scene HUD |
| `?finale=1` | preview the Halloween night finale |
| `?ws=ws://localhost:PORT` | listen for chat commands from a local relay (localhost only) |
| `?ca=<mint>` | override the contract address (otherwise read from `const CA` in `/index.html`) |

## OBS
Browser source → `https://hallowpeen.com/live/?obs=1` (add `&sound=1`), 1920×1080. Turn off "Shutdown source when not visible".
Right-click the source → Interact, then `/` or `Enter` opens the command box. Hotkeys: Shift+V/M/S/C/D/P/N = vent, meeting, sabotage, candy, dance, parade, new crewmate.

## Chat commands
`!vent` 20s · `!meeting` 60s · `!sabotage` 45s · `!candy` 30s · `!dance` 15s · `!parade` 60s · `!spawn [name]` 8s (cooldowns).
TikTok/X chat can't be read by a static site. Bridge it with TikFinity or Streamer.bot (keypress actions into the OBS Interact window),
or a tiny local relay that broadcasts text like `!candy` or JSON `{"cmd":"!vent","user":"x"}` / `{"comment":"!dance","nickname":"x"}` / `{"name":"Sussy Bob"}`:

```js
// npm i ws ; node relay.js ; then POST/pipe chat into broadcast()
const {WebSocketServer}=require('ws');const wss=new WebSocketServer({port:8787});
const broadcast=m=>wss.clients.forEach(c=>c.send(typeof m==='string'?m:JSON.stringify(m)));
process.stdin.on('data',d=>broadcast(String(d).trim())); // type !candy + Enter to test
```
then use `?obs=1&ws=ws://localhost:8787`.

## Names
The "Name a crewmate" box filters bad words/slurs (incl. leetspeak), 2-16 chars, no wallet-looking strings.
Viewers see their name move in on their own screen. Host/OBS screens queue names locally for the next new crewmates.
Curated names for everyone: add to `const NAMES=[...]` at the top of `sim.js`.

## Trades
Polls `https://api.dexscreener.com/tokens/v1/solana/<CA>` every ~45s. New buys ≈ change in 24h buy count (or the m5/h1 rate). Buy = new crewmate (max 25, then a task boost),
sell = faster impostor + sabotage chance, big buy (avg ≥ $750 or 12+ buys in one poll) = candy rain or Pumpkin King parade. API failure → "comms sabotaged", the show keeps running.
