/* =========================================================
   LOVE QUEST — chapter.js  (Chapter 3.3, 3.6)
   Owns the chapter/memory screen and the item-get overlay
   that caps off each chapter. Hands off to Battle after the
   memory beat, and gets called back once that battle (and
   any evolution) resolves.

   First-visit flow: chapter dialogue -> memory box -> battle ->
   (evolution, if this chapter triggers one) -> post-battle dialogue
   -> item-get overlay -> back to map.

   Revisit flow (chapter already in GameState.completedChapterIds):
   revisit dialogue only -> back to map. Memory box, battle, and the
   item-get overlay are all skipped, so a location that already
   triggered evolution (chapters 2/4) can't trigger it again.
   ========================================================= */

const Chapter = (function () {
  'use strict';

  let chapterBgEl, npcSpriteEl, npcPokemonSpriteEl, labelEl, titleEl;
  let memoryBoxEl, memoryLabelEl, memoryTitleEl, memoryTextEl, memoryContinueBtn;
  let itemOverlayEl, itemEmojiEl, itemNameEl, itemDescEl, itemContinueBtn;

  /** The StoryData.chapters[] entry currently in play. */
  let currentChapterData = null;

  function mount() {
    chapterBgEl = document.querySelector('#chapter .chapter-bg');
    npcSpriteEl = document.querySelector('#chapter .sprite-npc');
    // This used to be a placeholder for Lara ("sprite-player") — it's
    // since been repurposed to show the NPC's own Pokémon standing
    // beside them, so the class/variable name now says what it is.
    npcPokemonSpriteEl = document.querySelector('#chapter .sprite-npc-pokemon');
    labelEl = document.querySelector('#chapter .chapter-label');
    titleEl = document.querySelector('#chapter .chapter-title');

    memoryBoxEl = document.querySelector('.memory-box');
    memoryLabelEl = memoryBoxEl.querySelector('.memory-chapter-label');
    memoryTitleEl = memoryBoxEl.querySelector('.memory-title');
    memoryTextEl = memoryBoxEl.querySelector('.memory-text');
    memoryContinueBtn = memoryBoxEl.querySelector('.memory-continue');

    itemOverlayEl = document.querySelector('.item-get-overlay');
    itemEmojiEl = itemOverlayEl.querySelector('.item-get-emoji');
    itemNameEl = itemOverlayEl.querySelector('.item-get-name');
    itemDescEl = itemOverlayEl.querySelector('.item-get-desc');
    itemContinueBtn = itemOverlayEl.querySelector('.item-get-continue');
  }

  function findChapterByLocation(locationId) {
    return StoryData.chapters.find((c) => c.locationId === locationId) || null;
  }

  /** Called by Map when the player clicks an unlocked location. */
  function travelTo(locationId) {
    const data = findChapterByLocation(locationId);
    if (!data) {
      console.error(`[Chapter] no chapter data found for location "${locationId}".`);
      return;
    }
    currentChapterData = data;
    SceneManager.go('chapter');
  }

  /** The scrollable memory box — a variant of the dialogue box, but its own component since it stays open rather than typing/advancing line by line. */
  function showMemory() {
    return new Promise((resolve) => {
      memoryLabelEl.textContent = `CHAPTER ${currentChapterData.id}`;
      memoryTitleEl.textContent = currentChapterData.title;
      memoryTextEl.textContent = GameState.applyTemplate(currentChapterData.memoryText);
      memoryBoxEl.classList.remove('hidden');

      function onContinue(e) {
        e.stopPropagation();
        memoryBoxEl.classList.add('hidden');
        memoryContinueBtn.removeEventListener('click', onContinue);
        resolve();
      }
      memoryContinueBtn.addEventListener('click', onContinue);
    });
  }

  /**
   * Post-battle dialogue beat — runs in the same shared `.dialogue-box`
   * used for the opening chapter dialogue (Chapter 2.3's DialogueEngine),
   * just triggered after Battle/Evolution hand control back instead of
   * before. Reads from StoryData.chapters[n].postBattleDialogue so no
   * copy lives in this file. Falls back to a single blank line if that
   * array is empty, same convention DialogueEngine.run() already uses.
   */
  function showPostBattleDialogue() {
    const lines = (currentChapterData.postBattleDialogue && currentChapterData.postBattleDialogue.length)
      ? currentChapterData.postBattleDialogue
      : [''];
    return DialogueEngine.run({
      speaker: currentChapterData.npc,
      lines,
    });
  }

  /**
   * Revisit-only dialogue — plays instead of the full first-visit flow
   * when the player re-enters a location whose chapter is already
   * complete. Reads from StoryData.chapters[n].revisitDialogue.
   */
  function showRevisitDialogue() {
    const lines = (currentChapterData.revisitDialogue && currentChapterData.revisitDialogue.length)
      ? currentChapterData.revisitDialogue
      : [''];
    return DialogueEngine.run({
      speaker: currentChapterData.npc,
      lines,
    });
  }

  /** Single reusable item-get overlay — lives once outside every scene, like the dialogue box. */
  function showItemGet() {
    return new Promise((resolve) => {
      itemEmojiEl.textContent = '\u2726'; // placeholder glyph until a real icon exists (Ch. 5.1)
      itemNameEl.textContent = GameState.applyTemplate(currentChapterData.itemName);
      itemDescEl.textContent = GameState.applyTemplate(currentChapterData.itemDesc);
      itemOverlayEl.classList.remove('hidden');

      function onContinue(e) {
        e.stopPropagation();
        itemOverlayEl.classList.add('hidden');
        itemContinueBtn.removeEventListener('click', onContinue);
        resolve();
      }
      itemContinueBtn.addEventListener('click', onContinue);
    });
  }

  function init() {
    mount();
    SceneManager.register('chapter', {
      async onEnter() {
        if (!currentChapterData) {
          console.error('[Chapter] entered with no chapter data — call Chapter.travelTo(locationId) instead of SceneManager.go("chapter") directly.');
          return;
        }
        GameAudio.play('chapter');
        labelEl.textContent = `CHAPTER ${currentChapterData.id}`;
        titleEl.textContent = currentChapterData.title;

        // Chapter 3.3 — each location gets its own background instead
        // of every chapter sharing one generic image. Battle/evolution
        // backgrounds stay shared on purpose (out of scope here).
        Assets.setBg(chapterBgEl, Assets.chapterBg(currentChapterData.locationId));

        Assets.setBg(npcSpriteEl, Assets.trainer(currentChapterData.npcSprite));
        npcSpriteEl.classList.remove('sprite-walk-in');

        // battle.enemies is matched 1:1 by array position to chapters
        // (chapter.id 1 -> enemies[0], etc. — same lookup battle.js uses).
        const enemyData = StoryData.battle.enemies[currentChapterData.id - 1];
        if (enemyData) {
          Assets.setBg(npcPokemonSpriteEl, Assets.pokemonFront(enemyData.dex, enemyData.ext));
          // Each chapter's NPC Pokémon can have its own on-screen size
          // (StoryData.battle.enemies[n].chapterSpriteSize) instead of
          // every one sharing the .sprite-npc-pokemon CSS default —
          // different species, different sprite-sheet proportions.
          Assets.setSize(npcPokemonSpriteEl, enemyData.chapterSpriteSize);
        }
        npcPokemonSpriteEl.classList.remove('sprite-walk-in');

        // restart both walk-ins together each time the scene is entered
        void npcSpriteEl.offsetWidth;
        void npcPokemonSpriteEl.offsetWidth;
        npcSpriteEl.classList.add('sprite-walk-in');
        npcPokemonSpriteEl.classList.add('sprite-walk-in');

        const alreadyCompleted = GameState.state.completedChapterIds.includes(currentChapterData.id);

        if (alreadyCompleted) {
          // Revisit — skip memory box, battle, and item-get entirely so
          // completed events (including evolution, on chapters 2/4)
          // never re-fire on a second visit.
          await showRevisitDialogue();
          SceneManager.go('map');
          return;
        }

        await DialogueEngine.run({
          speaker: currentChapterData.npc,
          lines: currentChapterData.dialogue,
        });

        await showMemory();

        Battle.startFor(currentChapterData);
      },
    });
  }

  /**
   * Called by battle.js (directly, or via evolution.js) once the
   * chapter's battle is fully resolved. Runs the post-battle dialogue
   * beat first, then the existing item-get -> progress -> map
   * hand-off, unchanged. Only reachable on a first visit (see
   * onEnter's alreadyCompleted branch above).
   */
  function onBattleWon() {
    showPostBattleDialogue()
      .then(() => showItemGet())
      .then(() => {
        const itemSlotIndex = currentChapterData.id - 1;
        GameState.completeChapter(currentChapterData.id, itemSlotIndex);

        const locationIds = StoryData.map.locations.map((l) => l.id);
        const currentIdx = locationIds.indexOf(currentChapterData.locationId);
        const nextLocationId = locationIds[currentIdx + 1];
        if (nextLocationId) GameState.unlockLocation(nextLocationId);

        HUD.update();
        SceneManager.go('map');
      });
  }

  return { init, travelTo, onBattleWon, current: () => currentChapterData };
})();
window.Chapter = Chapter;
