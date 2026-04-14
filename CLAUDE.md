# Permit Rush — Claude Code Handoff

## Current repo state

**The scaffold described below is not yet committed.** As of this doc, the repo contains only `CLAUDE.md` — no `package.json`, no `src/`, no Vite config. Treat the "What works" section as the target state, not the current state. Before editing files under `src/`, verify they exist; if starting fresh, run Vite init and create the file map under "File map" below.

## What this is

A browser-based mobile puzzle game for a JavaScript game jam. Theme: **construction**. The player acts as a city permit officer — blueprint cards slide in, you swipe right to APPROVE or left to REJECT based on a visible rulebook. Wrong calls trigger disasters and drain lives. Think Papers Please meets Diner Dash.

**Target:** Portrait 1080×1920, web, YouTube Playables compatible.  
**Stack:** Vite + vanilla JS + Canvas 2D. No frameworks, no physics engine, no external assets.  
**Build:** `npm run dev` → `http://localhost:5173`

---

## Current state (scaffold complete)

The full game loop is wired and the production build is clean (`npm run build` passes, 25kb gzip). The game is playable end-to-end but needs content polish, visual refinement, and difficulty tuning.

### What works
- State machine: MENU → PLAYING → STAMPING → DISASTER → GAMEOVER
- Blueprint generator: procedural cards with all 10 rules, wave unlocking, red herrings
- Swipe left/right (touch + mouse) with drag preview offset on the card
- Timer per card (drains faster each wave)
- Lives (3), score, combo multiplier (up to 8x), speed bonus
- Procedural house illustrations drawn in canvas: floors, roof types (gable/hip/shed/flat), garage sizes, setback dimension line, solar panels, flood zone tint
- Rulebook panel shows active rules, highlights newly unlocked rules
- Web Audio API sounds (no sound files): stamp approve/reject, disaster crash, combo chime, timer warn
- Menu screen + game over screen with hi-score (localStorage)
- Disaster flash overlay showing violation IDs
- Canvas scales to any viewport maintaining 9:16 ratio

### What still needs work (days 6–13 of build plan)
- [ ] House illustration polish — garage and multi-floor rendering needs visual refinement
- [ ] Spec value warning colors on card should reflect actual violations (currently some are hardcoded in the mockup, not wired to `bp.violations`)
- [ ] Difficulty curve tuning — timer reduction per wave, valid/invalid card ratio
- [ ] More address variety and applicant name variety in blueprint generator
- [ ] Disaster cutscenes — currently just a red flash; should have 3–4 short canvas animations (collapse, flood, fire, blackout)
- [ ] Tutorial — first 2 cards with guided prompts explaining the swipe mechanic
- [ ] New rule unlock animation — currently just a banner, could be more dramatic
- [ ] Screen shake on disaster
- [ ] Combo counter pop animation
- [ ] Game over score breakdown (correct/incorrect stamps, fastest decision, etc.)
- [ ] YouTube Playables: IMA SDK hooks (ad pause/resume), first-session onboarding flow, 60-second loop tuning

---

## File map

```
src/
├── main.js                   ← game loop, RAF, state wiring, render dispatch
├── core/
│   ├── constants.js          ← COLORS, CONFIG, STATE enum, CANVAS_W/H
│   ├── CanvasManager.js      ← canvas setup, viewport scaling, screen→canvas coords
│   ├── StateMachine.js       ← simple event-emitting state machine
│   └── InputHandler.js       ← touch + mouse swipe/tap detection
├── data/
│   ├── rules.js              ← RULES array (10 rules), getActiveRules(wave), getNewRulesForWave(wave)
│   └── blueprintGenerator.js ← generateBlueprint(wave), createBaseBlueprint(), applyViolation()
├── systems/
│   ├── GameSession.js        ← score, combo, lives, timer, wave progression, hi-score
│   └── AudioSystem.js        ← Web Audio API procedural sounds, no files
└── render/
    ├── cardRenderer.js       ← drawBlueprintCard(ctx, bp, offsetX, stampState)
    ├── houseRenderer.js      ← drawHouseIllustration(ctx, bp, x, y, w, h)
    ├── hudRenderer.js        ← drawTopHUD, drawTimerBar, drawRulebook, drawSwipeHints
    └── screenRenderer.js     ← drawBackground, drawMenu, drawGameOver, drawDisasterFlash
```

---

## Key data structures

### Blueprint object
```js
{
  id: "BP-4291",
  address: "14 Maple Crest Dr",
  applicant: "R. Hoffmann",
  zone: "R1" | "R2" | "R3" | "flood" | "historic" | "HOA-A",
  floors: 1–4,
  roofType: "gable" | "hip" | "shed" | "flat",
  garageSize: "none" | "single" | "double" | "oversized",
  lotSize: 4000–12000,       // sq ft
  footprint: 800–4000,       // sq ft
  setback: 1–20,             // ft from property line
  foundation: "slab" | "crawl" | "basement" | "pier",
  solarPanels: true | false,
  treeRemoval: true | false,
  violations: ["R01", "R05"] // empty = valid card
}
```

### Rule object (from rules.js)
```js
{
  id: "R05",
  waveUnlock: 5,
  shortText: "No basements in flood zones",   // shown in rulebook panel
  fullText: "...",                             // for tutorial/tooltips
  check: (bp) => boolean,                     // true = violation present
  mutate: (bp) => void,                       // makes bp violate this rule
}
```

### Stamp state (passed to card renderer)
```js
{ type: "approve" | "reject", alpha: 0–1 }
```

---

## Rules by wave

| Rule | Unlocks | Description |
|------|---------|-------------|
| R01 | Wave 1 | R1 zone — max 2 floors |
| R02 | Wave 1 | No flat roofs in residential |
| R03 | Wave 3 | Garage cannot be oversized |
| R04 | Wave 3 | Min 6ft setback required |
| R05 | Wave 5 | No basements in flood zones |
| R06 | Wave 5 | Footprint ≤ 40% of lot |
| R07 | Wave 7 | Historic zone — no shed roofs |
| R08 | Wave 7 | R3 zone — max 3 floors |
| R09 | Wave 9 | HOA-A — solar needs board approval |
| R10 | Wave 9 | Historic zone — tree removal needs notice |

Wave unlocks trigger every 5 correct stamps. Waves progress 1→3→5→7→9.

---

## Design decisions to preserve

- **No asset pipeline** — everything drawn in canvas. House illustrations, UI, backgrounds are all code. Keeps build simple and matches the blueprint aesthetic.
- **No physics engine** — pure canvas 2D geometry.
- **No coroutines / async game logic** — all timing done via `setTimeout` for stamp/disaster delays, `requestAnimationFrame` delta for timer and animations. Keep it this way.
- **Spec values on the card are NOT color-coded** in the real game — the player must cross-reference the rulebook manually. The red warning colors in the early mockup were for prototyping only. Do not add visual hints to the card specs.
- **Red herrings** — valid cards from wave 5+ sometimes have borderline values (setback exactly 6ft, footprint exactly 39%) to create doubt. These are intentional. Don't remove them.
- **Invalid ratio** — ~55% of cards are invalid. Tunable via `CONFIG.INVALID_RATIO` in constants.js.
- **Timer expiry logic** — if time runs out, the game treats it as a wrong decision (wrong approve if card was invalid, wrong reject if card was valid). This is intentional — hesitation is punished.

---

## Art style

Blueprint schematic aesthetic:
- **Background:** near-black navy (`#0d1021`) with subtle dot/grid overlay
- **Cards:** dark navy (`#0a0e1f`) with blueprint grid dots, cyan top accent line
- **House illustrations:** cyan/blue linework on dark background, monospace labels
- **Typography:** monospace throughout (matches blueprint/technical feel)
- **Stamp:** bold rotated text with colored border — green APPROVED, red REJECTED
- **No gradients, no drop shadows, no images**

Color constants are all in `src/core/constants.js` under `COLORS`.

---

## YouTube Playables requirements (day 12)

- Game must work in a sandboxed iframe
- IMA SDK integration: pause game loop on ad start, resume on ad end
- Hook points to add in `main.js`:
  ```js
  window.onAdStart  = () => game.pause()
  window.onAdEnd    = () => game.resume()
  ```
- First session must have a clear CTA within 60 seconds
- No external network requests (already satisfied — no CDN deps at runtime)
- Single HTML file output: `npm run build` → `dist/` → zip and submit

---

## Suggested next tasks (in priority order)

1. **Wire spec warning colors to actual violations** — `cardRenderer.js` `drawSpecsGrid()` should check `bp.violations` to know which spec to color red. Currently the warn flags are hardcoded on the spec objects.
2. **Polish house renderer** — double-check multi-floor stacking, garage positioning for all sizes, roof shape accuracy for all 4 types.
3. **Disaster cutscenes** — replace the red flash in `screenRenderer.js` `drawDisasterFlash()` with 3–4 short canvas animations. Suggest: collapse (rectangles falling), flood (blue fill rising), fire (orange flicker), blackout (screen dims with sparks).
4. **Screen shake** — add a shakeOffset `{x, y}` to the render pass, applied via `ctx.translate()` at the top of `_render()`, triggered on disaster.
5. **Tutorial** — first 2 cards: pause timer, show arrow overlays pointing at rulebook and swipe directions.
6. **Difficulty balance pass** — playtest waves 1–5, tune `CONFIG.TIMER_REDUCTION_PER_WAVE` and `CONFIG.INVALID_RATIO`.
7. **YouTube Playables build** — add IMA SDK hooks, test in iframe sandbox.
