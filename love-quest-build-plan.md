# Love Quest — Rebuild Plan (Detailed)
### Clean rebuild, same story & concept. All dialogue/text left blank until the full project is built.

> **Rule for the whole rebuild:** No visible copy — no NPC lines, quiz questions, item flavor text, letter content, chapter titles beyond placeholders — gets hardcoded into HTML/JS. Everything writable lives in `storyData.js` as empty strings with clear key names, so you can sit down at the very end and fill in every word in one pass without touching code.

---

## Chapter 1 — Foundation & Architecture

### 1.1 Repo & Folder Structure
- Fresh private repo, GitHub Pages–ready from commit one
- Folder layout:
  ```
  love-quest/
  ├── index.html
  ├── css/
  │   └── style.css          (ONE file — no phase-numbered additions files)
  ├── js/
  │   ├── sceneManager.js
  │   ├── storyData.js        (blank content lives here)
  │   ├── dialogueEngine.js
  │   ├── audio.js
  │   ├── boot.js
  │   ├── map.js
  │   ├── chapter.js
  │   ├── battle.js
  │   ├── evolution.js
  │   ├── quiz.js
  │   ├── letter.js
  │   └── main.js              (wiring only — no logic lives here)
  ├── assets/
  │   ├── sprites/
  │   └── music/
  └── README.md
  ```
- One JS file = one responsibility. Avoids the old `main.js` doing boot logic *and* audio *and* global input handling all at once.

### 1.2 Design Tokens (CSS Variables)
- Rebuild the `:root` token set: color palette, pixel unit scale, font clamps, z-index layers, transition timings — carried over from the old system since it worked, just centralized in one place instead of drifting across 3 CSS files.
- Decide up front: does the palette stay "deep ocean meets warm twilight," or do you want to revisit it? (Flag this as an open decision, not blank text — palette isn't "her words," it's a design call you can make now.)

### 1.3 Base Reset & Global Styles
- `html/body` reset, pixelated image rendering, font smoothing off, base cursor/overflow rules.
- Scene system (`.scene`, `.active`, `.fade-out`) rebuilt as the backbone every screen plugs into — same pattern, cleaned up.

### 1.4 Dialogue Box — Single Reusable Component
- This is the biggest structural fix. Old build had `intro-dialogue-box`, `chapter-dialogue-box`, `battle-dialogue-box` as separate near-duplicate markup/CSS blocks.
- New build: **one** `.dialogue-box` component (speaker name slot, text slot, cursor, continue arrow, optional choice buttons) that every scene reuses via JS, not copy-pasted HTML.

### 1.5 Pixel Border Utility Classes
- `.pixel-border`, `.pixel-border-gold`, `.pixel-border-pink` — same double-shadow technique, defined once, used everywhere.

### 1.6 `storyData.js` — The Blank Content Schema
- One structured JS object holding every writable field as `""`, with comments describing what goes there. Example shape (illustrative, not final):
  ```js
  const StoryData = {
    boot: { subtitle: "", version: "" },
    intro: { openingLine: "", nameRevealText: "" },
    chapters: [
      { id: 1, title: "", location: "", npc: "", dialogue: [""], itemName: "", itemDesc: "" },
      // ...chapters 2–4
    ],
    quiz: {
      inscription: "",
      clues: [
        { question: "", answer: "" },
        // ...5 total
      ]
    },
    letter: { body: "" },
    easterEggs: { bookshelfMessage: "", playlistUrl: "" }
  };
  ```
- Built in Chapter 1 so every later chapter just *reads* from it — no scene code ever contains raw text.

### 1.7 Scene Manager Engine
- Rebuild `init()`, `go()`, `onEnter`/`onLeave` registry — same clean IIFE pattern as before, since it worked well; just make sure every new scene module follows it consistently (old code had a few scenes deviate).

---

## Chapter 2 — Core Scene Engine

### 2.1 Boot Screen
- Starfield background, title fade-in sequence, "PRESS START" prompt.
- Skip-on-input logic (first press skips animation, second press advances) rebuilt cleanly as one state machine instead of scattered boolean flags.

### 2.2 Name Reveal
- Letter-by-letter typing effect for "Lara" — built as a generic "typewriter" utility (see 2.3) rather than a one-off, so it's reusable for chapter titles, quiz feedback, etc.

### 2.3 Reusable Dialogue Engine
- Single `DialogueEngine` module: given a speaker + array of lines, it types them out with blinking cursor, waits for input to advance, supports optional branching choices (used later for inside-joke quiz wrong/right paths).
- This replaces the old approach where intro/chapter/battle scenes each reimplemented typewriter logic separately.

### 2.4 Intro Scene Wiring
- Mudkip sprite walks on, dialogue box opens using the engine from 2.3, pulls its (currently blank) line from `storyData.js`.

### 2.5 Global Input Handling
- One clean keyboard/click handler module — Enter/Space/Arrow/Z + click — routed through the scene manager rather than scene-specific `if` chains.

### 2.6 Audio Controller Skeleton
- `Audio.js` IIFE: mute toggle, track registry, per-scene track switching — built now (even with placeholder/no files yet) so every later scene can call `Audio.play('sceneName')` without retrofitting.

---

## Chapter 3 — World Map, Chapters & Battle System

### 3.1 World Map Screen
- Pixel art map, clickable regions per chapter/location (Lamoria Town, Whisper Clearing, Arcade Ruins, Echo Cave/Route 911, Summit of Firsts — names can stay as-is or you can rename, your call, not "her text").
- Click-to-travel navigation logic.

### 3.2 HUD
- Party info (Pokémon name/level/XP bar), item slots (locked/unlocked states for the 5 key items).

### 3.3 Chapter / Memory Screens
- Background + player/NPC sprite placement, dialogue box (reused component), choice buttons where relevant.
- Memory screen variant: chapter label, title, scrollable memory text box, item reveal — all text blank in `storyData.js`.

### 3.4 Battle System
- Battle background (sky/ground layers), enemy + player info panels with HP bars, FIGHT/ITEM/POKÉMON/RUN menu, move submenu, item submenu, damage number pop-ups.
- HP bar color states (high/mid/low).

### 3.5 Evolution Sequences
- Flash transition, before/after sprite swap, glowing evolution text — Mudkip→Marshtomp, Marshtomp→Swampert, Swampert→Mega Swampert (final reveal, tied into Chapter 4's letter scene).

### 3.6 Item-Get Screens
- Overlay with emoji, item name, description (blank), continue prompt — triggered at the end of each chapter for the 5 key items.

### 3.7 CSS Pixel Sprites (Enemies/Trainers)
- Rebuild the box-shadow pixel-art enemy sprites (Gastly, Noctowl, etc. — or swap for different trainers if you want to rename them) plus their idle animations.

---

## Chapter 4 — Quiz & Love Letter

### 4.1 Quiz Gate Screen
- Wooden gate visual, quiz box with inscription (blank), input + submit button, feedback states (correct/wrong with shake), progress counter (1/5).

### 4.2 Clue System Logic
- 5-question loop reading from `storyData.js.quiz.clues` (all blank questions/answers for now), answer-checking, wrong-path retry vs. right-path advance.

### 4.3 Mystery Reveal Sequence
- Collected clues flash on screen and assemble — mystery-show style — before handing off to the letter.

### 4.4 Love Letter Screen
- Typewriter-style scroll reveal using the Chapter 2 dialogue engine, `storyData.js.letter.body` left blank, fully-evolved Swampert/Jerome-reveal sprite standing beside it.

### 4.5 Final Reveal Tie-In
- Mega Swampert / "Jerome revealed" moment — connects back to the cloaked-sprite mechanic from 3.7.

### 4.6 Hidden Easter Eggs
- BL manhwa bookshelf (clickable, reveals blank secret-message field).
- SB19 concert poster (clickable, links to a playlist URL field — left blank for you to paste in later).

---

## Chapter 5 — Assets, Audio, Polish & Deploy

### 5.1 Sprite Sheet Sourcing/Creation
- Mudkip → Marshtomp → Swampert → Mega Swampert sprite sheets, sized to match the CSS animation specs. Options: free pixel-art packs, commissioning on Fiverr/itch.io, or generating placeholders to swap later.

### 5.2 Audio Track Sourcing
- Looping chiptune BGM per scene mood (boot/upbeat quiz/soft letter), royalty-free sources.

### 5.3 Howler.js Integration
- Wire the Chapter 2 audio skeleton to real tracks, mute persistence across scenes (no localStorage — in-memory only per site rules).

### 5.4 Mobile Responsive Pass
- Test every screen at phone width from the start (not patched at the end like before): map, battle menus, dialogue box, quiz input, letter scroll.

### 5.5 Cross-Browser / QA Checklist
- Full playthrough test: boot → intro → all 4 chapters → quiz → letter → easter eggs, on both desktop and mobile, checking for the kind of layout drift that forced the old "critical layout fixes" patch.

### 5.6 GitHub Pages Deploy
- Push, enable Pages, verify live link, optional `lara.quest` domain setup, final send-off timed for August 10.

---

*Every dialogue line, question, answer, letter, and hidden message stays blank in `storyData.js` until the whole engine is built and tested — then it's one focused writing pass at the end.*
