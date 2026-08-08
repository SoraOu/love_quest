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
    // `size` (width/height in px) controls how big that stage renders
    // in the evolution scene ONLY — set independently per stage since
    // sprite sheets don't all share one aspect ratio. Omit/remove a
    // stage's `size` to fall back to the .evolution-sprite CSS default.
    partyStageSprites: {
      mudkip:          { dex: 258, ext: "gif", size: { width: 160, height: 160 } },
      marshtomp:        { dex: 259, ext: "gif", size: { width: 160, height: 160 } },
      swampert:         { dex: 260, ext: "gif", size: { width: 320, height: 320 } },
      "mega-swampert":  { sheet: true, size: { width: 420, height: 420 } },
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
      "And why don't you give me a nickname if you want.",
      " After that we'll go!"
    ],   // full array if more than one line is needed
    nameRevealText: "Lara!",   // text shown as "Lara" types out letter-by-letter
    // Shown in the nickname-prompt overlay right after the opening
    // lines finish (boot.js). Whatever the player types becomes
    // GameState.partyLabel() everywhere the party's name shows (HUD,
    // battle panels, evolution text) and fills in any {mudkipName}
    // token used elsewhere in written dialogue/memory/item text.
    nicknamePrompt: "",
    // Fallback name used if the player confirms with the field left
    // blank. Pre-filled like the map location names — a sensible
    // default you can keep or change, not "her text."
    nicknameDefault: "Mudkip",
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
  //
  // Any line in dialogue/postBattleDialogue/revisitDialogue/memoryText/
  // itemName/itemDesc (and letter.body/signOff, evolution announceText,
  // mysteryReveal.assembleText) can include the token {mudkipName} —
  // it's swapped for whatever the player nicknamed their Mudkip before
  // the line is shown. e.g. "Careful, {mudkipName}!" ->
  // "Careful, Sparky!"
  // -------------------------------------------------------
  chapters: [
    {
      id: 1,
      locationId: "lamoria-town",
      npcSprite: "backpacker",
      title: "",
      location: "",
      npc: "Jonathan Dimagiba",
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
        "You win and you get this uhhhh...\nYou'll know once you've won...",
        "uhh...so yeah...",
        "Let's just fight already!"
      ],
      memoryText: "You saw a guy who seems to be lost. He challenged you to a pokemon battle to pass time but what's the importance of this? Maybe it's for the plot. Or maybe it's not important at all.",
      postBattleDialogue: [
        "Here, take this. I found it on a swamp somewhere when I was on my way here.",
        "I gotta find that Khaecy woman now.",
        "You sure you don't know her?"],
      revisitDialogue: [
        "Now where she?",
        "Maybe I should just ask another person if they know someone named Khaecy."
      ],
      itemName: "Honor X9d",
      itemDesc: "It's a smartphone. Unfortunately, it's locked and you don't know the password. \nAt least you got a new phone.",
    },
    {
      id: 2,
      locationId: "whisper-clearing",
      npcSprite: "hexmaniac-gen3",
      title: "",
      location: "",
      npc: "Cathy K. Fiko",
      dialogue: [
        "Who goes there?",
        "Just a kid. What'd you say your name was?",
        "...",
        "Interesting. \nI think I heard your name from somewhere but I don't remember.",
        "This place have done a lot to me you know.",
        "Add it to what's happening around right now.",
        "Talking pokemons, impeachment trials, and earlier today,\n I heard some story about a guy looking for some beautiful woman.",
        "He even left this umbrella because he's on a rush.",
        "It's getting cloudy, it might rain anytime soon. \nHow about we battle and if you win,\nyou get this umbrella.",
        "And if I win, you give me that Mudkip."
      ],
      memoryText: "You saw a woman who seems a bit weird. She challenged you on a pokemon battle.\n That umbrella in her hand though seems familiar to you though.",
      postBattleDialogue: [
        "Buwaka ng shemay!",
        "Your Mudkip evolved.",
        "I'm no longer interested anyways.",
        "Here's your umbrella.",
        "Take care out there."
      ],
      revisitDialogue: ["Maybe I shouldn't have gave that umbrella away."],
      itemName: "Black Umbrella",
      itemDesc: "A black umbrella. \nOn the handle, you can see initials that says J.L.",
    },
    {
      id: 3,
      locationId: "arcade-ruins",
      npcSprite: "collector",
      title: "",
      location: "",
      npc: "Sora?",
      dialogue: [
        "Oh hello fellow trainer.",
        "I am Sora, a gamer who knows no bounds when it comes to greatness.",
        "Yes I'm the mighty-",
        "What? I don't look like someone named Sora?",
        "Fine fine you got me. ",
        "I just saw this guy who seem kinda cool.",
        "What was he doing?",
        "Well he was just sitting on that corner over there and he kind of seems like counting mosquitoes?",
        "I'm not crazy!\nI even approached him and he asked me if theres mosquitoes in my direction.",
        "Why did he seem so cool?",
        "Well I saw him playing some game and he\n and he's on that bird hero he's using.",
        "Gosh I wanna be like him.",
        "Let's battle, I'll show I can be as good as him!"
      ],
      memoryText: "A guy named Sora challenged you to a pokemon battle. You don't know why but that name sounds familiar to you.",
      postBattleDialogue: ["I commend you on your greatness.",
        "Here take this.",
        "You deserve it.",
        "That Sora guy told me to give this to the person who defeats me on a pokemon battle.",
        "It was as if he knew that's going to happen.",
        "What is he? A fortune teller?",
        "Or maybe he actually created this world and we are both in a simulation or some kind of game\nwhere he wrote everything I'm saying here to convey his feelings to a certain person in a way he can express himself\nand the person receiving this will most likely enjoy this type of art, scene, or form of message because he knows\nthat person very well.",
        "...",
        "...",
        "Or maybe he's a fortune teller"
      ],
      revisitDialogue: ["Hmmm, so the game he was playing was called Mobile Legends."],
      itemName: "Sisig",
      itemDesc: "There a note on this food pack which says 'Eat this. You must have come a long way to reach this far.\nContinue on and you'll eventually reach the end.'",
    },
    {
      id: 4,
      locationId: "echo-cave",
      npcSprite: "hiker",
      title: "",
      location: "",
      npc: "Prospector John",
      dialogue: [
        "I used to play Roblox.",
        "And in roblox, I played this game called Prospecting.",
        "You pan water for minerals and oh was it fun.",
        "Have you played that?",
        "Oh you did?",
        "Dang. That dude was right.",
        "He told me that a girl would come by and she will know the Prospecting game I was talking about.",
        "He also told me to give this to you...",
        "But I don't want to now.",
        "Maybe I should just run away with this.",
        "Wait wait what are you doing??",
        "I don't want to battle!",
        "AHHHHHHHHHHHH!!"
      ],
      memoryText: "This guy wanted to run away with the thing a certain person told him to give to you\nso you challenged him on a pokemon battle.",
      postBattleDialogue: [
        "Dang it!",
        "Here! Take it!",
        "I don't want it anymore"
      ],
      revisitDialogue: ["It looked yummy too. \n*sigh*"],
      itemName: "Mango Graham",
      itemDesc: "A meal is not complete without desert...\nDessert? Desertt?\nBasta yung panghimagas.",
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
    //
    // chapterSpriteSize (width/height in px) controls how big this
    // Pokémon renders standing beside its trainer on the chapter/
    // memory screen ONLY — the actual battle-scene sprite size is
    // untouched (still the shared .battle-sprite-enemy CSS size).
    // Set independently per chapter since sprite sheets vary. Omit/
    // remove a chapter's chapterSpriteSize to fall back to the
    // .sprite-npc-pokemon CSS default.
    enemies: [
      { id: "sunflora",   name: "Sunflora",   dex: 192, ext: "gif", introLine: "", chapterSpriteSize: { width: 96, height: 176 } }, // Ch.1 — Lamoria Town
      { id: "noctowl",    name: "Noctowl",    dex: 164, ext: "gif", introLine: "", chapterSpriteSize: { width: 96, height: 176 } }, // Ch.2 — Whisper Clearing
      { id: "dusknoir",   name: "Dusknoir",   dex: 477, ext: "gif", introLine: "", chapterSpriteSize: { width: 216, height: 396 } }, // Ch.3 — Arcade Ruins
      { id: "roggenrola", name: "Roggenrola", dex: 524, ext: "gif", introLine: "", chapterSpriteSize: { width: 96, height: 176 } }, // Ch.4 — Echo Cave
    ],
    moveNames: [""],       // Mudkip/Marshtomp/Swampert move labels, if custom
    victoryLine: "",
  },

  // -------------------------------------------------------
  // Evolution sequences (Chapter 3.5)
  // -------------------------------------------------------
  evolution: {
    mudkipToMarshtomp: { announceText: "Your Mudkip Evolved into Marshtomp!" },
    marshtompToSwampert: { announceText: "Your Marshtomop Evolved into Swampert!" },
    swampertToMega: { announceText: "Woah! What the helly a Mega Evolution!" }, // tied to Chapter 4 letter/reveal
  },

  // -------------------------------------------------------
  // Quiz gate (Chapter 4.1, 4.2) — 5 clues total.
  // -------------------------------------------------------
  quiz: {
    inscription: "Inscription",
    clues: [
      { question: "Who is her main hero in Mobile Legends?", answer: "Zetian" },
      { question: "What is her favorite food?", answer: "Sisig" },
      { question: "What is the date today?", answer: "August 10" },
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
