# Asset drop-in guide

Drop your files into these exact paths — the code references them
by these names, so no code changes are needed once they're in place.

```
assets/
├── dialogue-box.png              <- dialogue box background art
├── mega-swampert-sheet.gif        <- final-reveal sprite (Ch. 4.5, not wired yet)
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
