# 24/7 HallowPeen TV

Live page: https://hallowpeen.com/live/  (animated always-on channel; `sim.js` + `sim.css`, no build step)

This is an **animated cartoon show**, not a person streaming. It reacts to real $HPEEN buys from DexScreener. No fake viewer counts or invented trades.

## URL options
| param | what it does |
|---|---|
| `?demo=1` | fake buys and sells every few seconds (rehearsal) |
| `?obs=1` | bare 16:9 scene (transparent page, no chrome); kept for optional capture |
| `?host=1` | host panel under the scene (command buttons + name queue) |
| `?sound=1` | sound on at load |
| `?hud=0` | hide the in-scene HUD |
| `?finale=1` | preview the Halloween night finale |
| `?ws=ws://localhost:PORT` | listen for chat commands from a local relay (localhost only) |
| `?ca=<mint>` | override the contract address (otherwise read from `const CA` in `/index.html`) |

## Names
The "Name a crewmate" box filters bad words/slurs (incl. leetspeak), 2-16 chars, no wallet-looking strings.
Viewers see their name move in on their own screen.
Curated names for everyone: add to `const NAMES=[...]` at the top of `sim.js`.

## Trades
Polls `https://api.dexscreener.com/tokens/v1/solana/<CA>` every ~45s. New buys ≈ change in 24h buy count (or the m5/h1 rate). Buy = new crewmate (max 25, then a task boost),
sell = faster impostor + sabotage chance, big buy (avg ≥ $750 or 12+ buys in one poll) = candy rain or Pumpkin King parade. API failure → "comms sabotaged", the show keeps running with no invented trades.
