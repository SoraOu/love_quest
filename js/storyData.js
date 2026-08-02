/* =========================================================
   LOVE QUEST — storyData.js
   THE RULE: no visible copy is ever hardcoded into HTML/JS.
   Every writable field lives here as "". Scene modules only
   ever READ from StoryData — they never contain raw text.

   When it's time to write, this is the ONLY file that gets
   touched to fill in every word in the game.
   ========================================================= */

const StoryData = {

  // -------------------------------------------------------
  // Boot screen (Chapter 2.1)
  // -------------------------------------------------------
  boot: {
    subtitle: "JirumDevs.org",   // small text under the title on the boot screen
    version: "8.10.26",    // e.g. a version/date stamp, optional flavor
  },

  // -------------------------------------------------------
  // Asset paths — NOT copy, just where real files live on disk.
  // See assets/README.md for the exact drop-in folder layout.
  // -------------------------------------------------------
  assets: {
    pokemonFrontDir: "assets/sprites/pokemon/front",
    pokemonBackDir: "assets/sprites/pokemon/back",
    trainerDir: "assets/sprites/trainers",
    // One background per chapter location (Chapter 3.3), keyed by
    // locationId — e.g. assets/scenes/chapters/lamoria-town.gif.
    // Drop files in as they're ready; the placeholder color in
    // .chapter-bg (style.css) shows until a given one exists.
    chapterBgDir: "assets/scenes/chapters",
    dialogueBoxImg: "assets/dialogue-box.png",
    megaSwampertSheet: "assets/mega-swampert-sheet.gif",
    // Party evolution stage -> sprite lookup. Mega Swampert has no back
    // sprite (it never appears in battle — only in the Ch.4.5 reveal),
    // so `sheet: true` skips the dex-based lookup for that stage.
    partyStageSprites: {
      mudkip:          { dex: 258, ext: "gif" },
      marshtomp:        { dex: 259, ext: "gif" },
      swampert:         { dex: 260, ext: "gif" },
      "mega-swampert":  { sheet: true },
    },
  },

  // -------------------------------------------------------
  // Name reveal / intro (Chapter 2.2, 2.4)
  // -------------------------------------------------------
  intro: {
    openingLine: "Finally! You're awake!",      // Mudkip's opening dialogue line(s) — array below
    openingLines: [
      "Finally! You're awake!",
      "Hurry up and let's go we've got a lot to-",
      "...",
      "Huh? Who am I?",
      "Well obviously I'm Mud-",
      "Oh",
      "My bad, I'm a bit of in a rush, haha.",
      "This must be weird and all but, rest assured that you're not dreaming.",
      "I am indeed a talking Mudkip.",
      "And before you scream and go shout for help, please listen to me first.",
      "This world have been changing day by day and all it's inhabitants have been acting weird.",
      "How weird you say?",
      "For starters, I began talking like a human.",
      "...",
      "Is that weird enough?",
      "Now that I got yor attention, I need you to help me get to the root of all this.",
      "You have no choice, youre stuck with me now mwehehehhehe",
      "Shall we?"
    ],   // full array if more than one line is needed
    nameRevealText: "Lara!",   // text shown as "Lara" types out letter-by-letter
  },

  // -------------------------------------------------------
  // World map labels (Chapter 3.1)
  // Location names can stay as placeholders or be renamed —
  // not "her text," a world-building call you can make anytime.
  // -------------------------------------------------------
  map: {
    locations: [
      { id: "lamoria-town",   name: "Lamoria Town",        chapter: 1 },
      { id: "whisper-clearing", name: "Whisper Clearing",  chapter: 2 },
      { id: "arcade-ruins",   name: "Arcade Ruins",        chapter: 3 },
      { id: "echo-cave",      name: "Echo Cave / Route 911", chapter: 4 },
      { id: "summit-of-firsts", name: "Summit of Firsts",  chapter: 5 },
    ],
  },

  // -------------------------------------------------------
  // Chapters / memory screens (Chapter 3.3)
  // dialogue: array of lines fed straight into DialogueEngine,
  //           played the FIRST time the player enters the chapter.
  // postBattleDialogue: array of lines fed into DialogueEngine
  //           after the chapter's battle (and evolution, if any)
  //           resolves — plays right before the item-get overlay.
  // revisitDialogue: array of lines played instead of the above
  //           when the player re-enters a location whose chapter is
  //           already complete — memory box, battle, and item-get
  //           are all skipped on a revisit, so this is the only
  //           thing that plays before returning to the map. Keeps
  //           chapters 2/4 (which trigger evolution) from re-firing
  //           that sequence on a second visit.
  // itemName/itemDesc: shown on the item-get screen (3.6).
  // -------------------------------------------------------
  chapters: [
    {
      id: 1,
      locationId: "lamoria-town",
      npcSprite: "backpacker",
      title: "",
      location: "",
      npc: "",
      dialogue: [
        "Dang it! I'm lost.",
        "First I got separated from the group and now I'm stuck on this village.",
        "The folks told me to look for that girl coz she knows every thing here",
        "At least give me a break and at least let me bump into her-",
        "Oh?\n.  .  .",
        "Hello there miss, you don't happen to be Khaecy right?",
        "You're not?",
        "You must be from here right? Do you know a girl named Khaecy?",
        "You're not from here?\n.  .  .",
        "Of course you're not.",
        "*sighs*",
        "You know what? I'm bored. Let's have a battle to pass time.",
        "You win and you get this uhhhh...\nI don't know what this is...",
        "Seems cool so...",
        "Let's just fight already!"
      ],
      memoryText: "You saw a guy who seems to be lost. He challenged you to a pokemon battle to pass time but what's the importance of this? Maybe it's for the plot. Or maybe it's not important at all.",
      postBattleDialogue: [""],
      itemName: "Item Name",
      itemDesc: "Item Description",
    },
    {
      id: 2,
      locationId: "whisper-clearing",
      npcSprite: "hexmaniac-gen3",
      title: "",
      location: "",
      npc: "",
      dialogue: [""],
      memoryText: "",
      postBattleDialogue: [""],
      revisitDialogue: [""],
      itemName: "",
      itemDesc: "",
    },
    {
      id: 3,
      locationId: "arcade-ruins",
      npcSprite: "collector",
      title: "",
      location: "",
      npc: "",
      dialogue: [""],
      memoryText: "",
      postBattleDialogue: [""],
      revisitDialogue: [""],
      itemName: "",
      itemDesc: "",
    },
    {
      id: 4,
      locationId: "echo-cave",
      npcSprite: "hiker",
      title: "",
      location: "",
      npc: "",
      dialogue: [""],
      memoryText: "",
      postBattleDialogue: [""],
      revisitDialogue: [""],
      itemName: "",
      itemDesc: "",
    },
  ],

  // -------------------------------------------------------
  // Battle system (Chapter 3.4) — enemy/trainer names + flavor.
  // Rename freely; these are world-building, not "her words."
  // -------------------------------------------------------
  battle: {
    // One real Pokémon per chapter, matched 1:1 by array position to
    // StoryData.chapters (chapter 1 -> enemies[0], etc). dex/ext point
    // at assets/sprites/pokemon/front/<dex>.<ext>.
    enemies: [
      { id: "sunflora",   name: "Sunflora",   dex: 192, ext: "gif", introLine: "" }, // Ch.1 — Lamoria Town
      { id: "noctowl",    name: "Noctowl",    dex: 164, ext: "gif", introLine: "" }, // Ch.2 — Whisper Clearing
      { id: "dusknoir",   name: "Dusknoir",   dex: 477, ext: "gif", introLine: "" }, // Ch.3 — Arcade Ruins
      { id: "roggenrola", name: "Roggenrola", dex: 524, ext: "gif", introLine: "" }, // Ch.4 — Echo Cave
    ],
    moveNames: [""],       // Mudkip/Marshtomp/Swampert move labels, if custom
    victoryLine: "",
  },

  // -------------------------------------------------------
  // Evolution sequences (Chapter 3.5)
  // -------------------------------------------------------
  evolution: {
    mudkipToMarshtomp: { announceText: "" },
    marshtompToSwampert: { announceText: "" },
    swampertToMega: { announceText: "" }, // tied to Chapter 4 letter/reveal
  },

  // -------------------------------------------------------
  // Quiz gate (Chapter 4.1, 4.2) — 5 clues total.
  // -------------------------------------------------------
  quiz: {
    inscription: "",
    clues: [
      { question: "question", answer: "answer" },
      { question: "question", answer: "answer" },
      { question: "question", answer: "answer" },
      { question: "question", answer: "answer" },
      { question: "question", answer: "answer" },
    ],
    wrongFeedback: "",   // shown on incorrect answer
    correctFeedback: "", // shown on correct answer
  },

  // -------------------------------------------------------
  // Mystery reveal (Chapter 4.3)
  // -------------------------------------------------------
  mysteryReveal: {
    assembleText: "", // text shown as clues assemble
  },

  // -------------------------------------------------------
  // Love letter (Chapter 4.4)
  // -------------------------------------------------------
  letter: {
    body: "",
    signOff: "",
  },

  // -------------------------------------------------------
  // Final reveal (Chapter 4.5)
  // -------------------------------------------------------
  finalReveal: {
    revealText: "", // "Jerome revealed" moment text
  },

  // -------------------------------------------------------
  // Hidden easter eggs (Chapter 4.6)
  // -------------------------------------------------------
  easterEggs: {
    bookshelfMessage: "",
    playlistUrl: "",
  },
};

// Exposed as a plain global — no bundler in this project.
// (If a module system gets introduced later, switch this one line.)
window.StoryData = StoryData;
