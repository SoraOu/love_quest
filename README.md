# Love Quest

A pixel-art, Pokémon-style interactive story built for GitHub Pages.

## Status

**Chapters 1–4 of the rebuild plan — complete.** Only Chapter 5
(assets/audio/polish/deploy) remains, and real sprites/art are
already wired in ahead of schedule (see below).

Chapter 1 — Foundation & Architecture
- [x] 1.1 Repo & folder structure
- [x] 1.2 Design tokens (CSS variables)
- [x] 1.3 Base reset & global styles + scene system
- [x] 1.4 Single reusable dialogue box component
- [x] 1.5 Pixel border utility classes
- [x] 1.6 `storyData.js` blank content schema
- [x] 1.7 Scene manager engine (`init` / `register` / `go`)

Chapter 2 — Core Scene Engine
- [x] 2.1 Boot screen (starfield, title fade-in, press-start skip/advance state machine)
- [x] 2.2 Name reveal (generic typewriter utility)
- [x] 2.3 Reusable `DialogueEngine` (typed lines, branching choices)
- [x] 2.4 Intro scene wiring (Mudkip walk-on + dialogue)
- [x] 2.5 Global input handling (`input.js` — keyboard + click, routed through `SceneManager`)
- [x] 2.6 Audio controller skeleton (`GameAudio` — no-ops gracefully until real tracks exist)

Chapter 3 — World Map, Chapters & Battle System
- [x] 3.1 World map screen (`map.js` — click-to-travel, locked/unlocked locations)
- [x] 3.2 HUD (party stage/level/XP bar, 5 item slots)
- [x] 3.3 Chapter / memory screens (`chapter.js` — dialogue + scrollable memory box)
- [x] 3.4 Battle system (`battle.js` — FIGHT/ITEM/POK&Eacute;MON/RUN, HP bars, damage pop-ups)
- [x] 3.5 Evolution sequences (`evolution.js` — flash transition, sprite swap, glowing text)
- [x] 3.6 Item-get overlay (single reusable instance, like the dialogue box)
- [x] 3.7 Pixel sprite placeholders for enemies/trainers + party stages (idle animation, swappable for real sprite sheets in Ch. 5)

Try it: boot → name reveal → intro (real Mudkip sprite!) → world map →
click Lamoria Town → dialogue → memory box → battle a real Sunflora →
item-get overlay → evolution sequence after Chapter 2's and Chapter 4's
battles → back to the map with the next location unlocked.

**Design note:** the world map has 5 locations but the chapter/battle loop
only claims 4 of them — "Summit of Firsts" is where Chapter 4's
quiz/letter/finale sequence begins instead of another battle.

Chapter 4 — Quiz & Love Letter
- [x] 4.1 Quiz gate screen (`quiz.js` — wooden-gate visual, inscription,
      input + submit, correct/wrong feedback with shake, "n / 5" progress)
- [x] 4.2 Clue system logic (5-question loop reading from
      `storyData.js.quiz.clues`, case/whitespace-insensitive answer check)
- [x] 4.3 Mystery reveal sequence (`quiz.js` — clues stagger into view as
      chips, assemble text types out, hands off to the letter)
- [x] 4.4 Love letter screen (`letter.js` — typewriter reveal via the
      Chapter 2 dialogue engine's `typeInto`, evolved Swampert sprite
      standing beside it)
- [x] 4.5 Final reveal tie-in (Swampert → Mega Swampert, reusing
      `evolution.js`'s same flash/swap/glow mechanic from 3.5/3.7 —
      just the biggest one, with an extra glow class)
- [x] 4.6 Hidden easter eggs (`letter.js` — two understated hotspots on
      the finale scene, one bookshelf message, one poster/playlist link,
      sharing one reusable secret-popup component)

Play all the way through: ... → Summit of Firsts → quiz gate (5 clues) →
mystery reveal → love letter → Mega Swampert reveal → finale screen with
two hidden easter eggs. That's the whole engine, start to finish.

## Real assets are wired in

See `assets/README.md` for the exact drop-in folder layout. Once your
files are in place:

| What | Source |
|---|---|
| Mudkip/Marshtomp/Swampert front sprites | intro walk-on, evolution before/after |
| Mudkip/Marshtomp/Swampert back sprites | your Pokémon's battle sprite |
| Sunflora / Noctowl / Dusknoir / Roggenrola | Chapters 1–4 battle enemies, one each |
| backpacker / hexmaniac-gen3 / collector / hiker | Chapters 1–4 NPC sprites |
| `dialogue-box.png` | background art for the shared dialogue box |
| `mega-swampert-sheet.gif` | the finale scene, once the Ch. 4.5 reveal advances the party stage |

Everything else you sent (Raichu, Vileplume, Dugtrio, Weepinbell, Mr. Mime,
Jynx, Togetic, Stantler, Cacturne, Altaria, Roserade, Drifblim, Togekiss,
Bouffalant, Talonflame, Carbink, Comfey, blackbelt, galacticgrunt,
gentleman) isn't wired to anything yet — good material for Chapter 4
easter eggs or extra flavor.

Everything else in the [build plan](./love-quest-build-plan.md) is still ahead:
quiz gate, mystery reveal, love letter, final reveal, easter eggs, real
audio, and the final content-writing pass.

## The one rule

No visible copy — no NPC lines, quiz questions, item flavor text, letter
content, chapter titles — ever gets hardcoded into HTML/JS. Everything
writable lives in `js/storyData.js` as an empty string with a clear key
name, so the whole game can be written in one focused pass at the end
without touching any code.

## Animation audit pass

Ran the game's CSS/JS through an animation-quality audit (Emil Kowalski's
design-engineering standards). Fixed:

- **Performance** — the HP bar and XP bar animated `width` (a layout
  property); switched both to `transform: scaleX()` with a left-anchored
  `transform-origin` (see `battle.js`/`map.js` + `style.css`).
- **Easing cohesion** — everything shared one `ease-in-out` token,
  including hover states and scene enter/exit. Added `--ease-out`
  (entrances/exits) and `--ease-hover` (hover/color changes) and
  retargeted the relevant rules.
- **Reduced-motion bug** — `prefers-reduced-motion` collapsed the
  blinking dialogue cursor to a single frozen (invisible) frame,
  silently hiding a real "still typing" affordance. It now stays
  steadily visible instead.
- **Touch false-hover** — the map location and easter-egg hover lifts
  weren't gated behind `(hover: hover) and (pointer: fine)`, so tapping
  on mobile could leave them visually "stuck" hovered.
- **Missed opportunity** — the item-get and secret-message overlays
  teleported via `display: none` with zero transition; they now fade
  and scale in/out like a proper modal (reusing the fade pattern
  `.scene` already established elsewhere in the file).

Left alone, on purpose: the `steps()` pixel-art easings (`--ease-pixel`)
are a deliberate aesthetic choice, not a bug; a few CONTINUE-style
buttons (`.memory-continue`, `.item-get-continue`, `.quiz-submit`,
`.secret-continue`) have no hover transition at all rather than a
mis-eased one — fine as-is, adding one is optional polish, not a fix.

## Folder structure

```
love-quest/
├── index.html
├── css/
│   └── style.css          — ONE stylesheet, no phase-numbered files
├── js/
│   ├── storyData.js        — blank content lives here + asset path config
│   ├── assets.js            — resolves real sprite/image file paths
│   ├── sceneManager.js     — init() / go() / onEnter / onLeave / onInput
│   ├── input.js             — keyboard + click, routed through SceneManager
│   ├── dialogueEngine.js   — typewriter utility + reusable DialogueEngine
│   ├── audio.js            — GameAudio skeleton, no-ops until real tracks exist
│   ├── boot.js             — boot screen, name reveal, intro dialogue
│   ├── map.js               — GameState, HUD, world map
│   ├── chapter.js           — chapter/memory screens, item-get overlay
│   ├── battle.js            — battle system
│   ├── evolution.js         — evolution sequences
│   ├── quiz.js               — quiz gate, clue loop, mystery reveal
│   ├── letter.js             — love letter, final reveal, easter eggs
│   └── main.js               — wiring only, no game logic
├── assets/
│   ├── sprites/
│   └── music/
└── README.md
```

## Running locally

No build step. Serve the folder with any static server, e.g.:

```
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Deploying

Push to GitHub, enable Pages on the `main` branch (root), done. See
Chapter 5.6 of the build plan for the full checklist.

# Asset drop-in guide

Drop your files into these exact paths — the code references them
by these names, so no code changes are needed once they're in place.

```
assets/
├── dialogue-box.png              <- dialogue box background art
├── mega-swampert-sheet.gif        <- final-reveal sprite (Ch. 4.5, not wired yet)
├── portrait.jpg                   <- her photo, source for the finale
│                                     text-art easter egg (Ch. 4.6, bookshelf
│                                     button) — rendered into text by
│                                     js/textArt.js, no code changes needed
├── music/                         <- 3 tracks, already wired (see below)
│   ├── overall.mp3      (boot, name-reveal, intro, map, chapter,
│   │                      evolution, quiz, mystery-reveal, finale)
│   ├── battle.mp3       (battle screen only)
│   └── letter.mp3       (love letter screen only)
├── scenes/                        <- full-bleed scene background photos
│   ├── boot.jpg         (title screen)
│   ├── name-reveal.jpg  (name reveal)
│   ├── intro.jpg        (intro scene)
│   ├── map.jpg          (world map)
│   ├── chapter.jpg      (chapter/memory screens — shared by all 4 for now)
│   ├── battle.jpg       (battle screen)
│   ├── evolution.jpg    (evolution sequence)
│   ├── quiz.jpg         (quiz gate)
│   ├── mystery.jpg      (mystery reveal)
│   ├── letter.jpg       (love letter)
│   └── finale.jpg       (finale / Mega Swampert reveal)
└── sprites/
    ├── pokemon/
    │   ├── front/
    │   │   ├── 192.gif  (Sunflora  — Chapter 1 enemy)
    │   │   ├── 164.gif  (Noctowl   — Chapter 2 enemy)
    │   │   ├── 477.gif  (Dusknoir  — Chapter 3 enemy)
    │   │   ├── 524.gif  (Roggenrola— Chapter 4 enemy)
    │   │   ├── 258.gif  (Mudkip    — intro / evolution "before")
    │   │   ├── 259.gif  (Marshtomp)
    │   │   └── 260.gif  (Swampert)
    │   └── back/
    │       ├── 258.gif  (Mudkip    — player's battle sprite)
    │       ├── 259.gif  (Marshtomp)
    │       └── 260.gif  (Swampert)
    └── trainers/
        ├── backpacker.png     (Chapter 1 NPC)
        ├── hexmaniac-gen3.png (Chapter 2 NPC)
        ├── collector.png      (Chapter 3 NPC)
        └── hiker.png          (Chapter 4 NPC)
```

Everything else you sent (Raichu, Vileplume, Dugtrio, Weepinbell, Mr. Mime,
Jynx, Togetic, Stantler, Cacturne, Altaria, Roserade, Drifblim, Togekiss,
Bouffalant, Talonflame, Carbink, Comfey, blackbelt, galacticgrunt,
gentleman) isn't wired to anything yet — free to use for Chapter 4 easter
eggs or extra flavor later. Drop them in the same folders regardless;
unused files don't break anything.

## Music

3 tracks total, already registered in `js/main.js` — `overall.mp3` covers
every scene except battle and letter (and keeps playing without
restarting as you move between those scenes), `battle.mp3` plays only
during the battle screen, `letter.mp3` plays only on the love letter
screen. Drop the three files into `assets/music/` with those exact
names and they start working immediately, same as everything else in
this guide — no code changes needed. `.mp3` is the safest format for
browser compatibility; if you'd rather use `.wav` or `.ogg`, say so and
I'll update the file extensions in `main.js` to match.

Every scene currently shows a flat placeholder color (`--color-bg-placeholder`
in style.css) instead of art. Each one is already pointed at a file under
`assets/scenes/` (see the tree above) — nothing loads yet because those
files don't exist. Drop a same-named `.jpg` into that folder and it appears
immediately, no code changes needed; until then the CSS just quietly falls
back to the flat color, same as `dialogue-box.png`. Every scene is one
image except `chapter.jpg`, which is shared by all four chapter/memory
screens — say the word if you want a distinct background per chapter
instead and I'll wire that up (four filenames + a one-line change per
chapter in storyData.js).