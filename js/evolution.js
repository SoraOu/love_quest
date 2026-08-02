/* =========================================================
   LOVE QUEST — evolution.js  (Chapter 3.5, 4.5)
   Flash transition, before/after sprite swap, glowing
   evolution text. Triggered by battle.js after specific
   chapter victories (Mudkip->Marshtomp after Ch.2,
   Marshtomp->Swampert after Ch.4), AND reused as-is by
   letter.js for the Ch.4.5 Swampert->Mega Swampert final
   reveal (the "cloaked-sprite mechanic" pay-off) — same
   flash/swap/glow beat, just a bigger moment, so it gets the
   extra `.evolution-sprite-mega` glow via the `isFinal` flag.
   ========================================================= */

const Evolution = (function () {
  'use strict';

  let flashEl, spriteEl, textEl;
  let onDoneCallback = null;

  const ANNOUNCE_KEY_BY_CHAPTER = {
    2: 'mudkipToMarshtomp',
    4: 'marshtompToSwampert',
    5: 'swampertToMega', // not a real chapter id — used only by letter.js's final reveal
  };

  const FINAL_REVEAL_KEY = 5;

  function mount() {
    flashEl = document.querySelector('#evolution .evolution-flash');
    spriteEl = document.querySelector('#evolution .evolution-sprite');
    textEl = document.querySelector('#evolution .evolution-text');
  }

  function wait(ms) {
    return new Promise((resolve) => window.setTimeout(resolve, ms));
  }

  /**
   * @param {number} chapterId - which chapter's victory triggered this
   * @param {Function} onDone - called once the player advances past the reveal
   */
  function startFor(chapterId, onDone) {
    onDoneCallback = onDone;
    SceneManager.go('evolution', { chapterId });
  }

  function init() {
    mount();
    SceneManager.register('evolution', {
      async onEnter(payload) {
        const chapterId = payload && payload.chapterId;
        const key = ANNOUNCE_KEY_BY_CHAPTER[chapterId];
        const announceText = key ? StoryData.evolution[key].announceText : '';
        const isFinal = chapterId === FINAL_REVEAL_KEY;

        GameAudio.play('evolution');

        // Before sprite: current stage, static.
        spriteEl.className = 'sprite evolution-sprite';
        Assets.setBg(spriteEl, Assets.partyFront(GameState.state.partyStage));
        textEl.textContent = '';
        flashEl.classList.remove('evolution-flash-active');

        await wait(500);
        flashEl.classList.add('evolution-flash-active');
        await wait(350);

        GameState.evolve();

        // After sprite: new stage, revealed once the flash covers the swap.
        Assets.setBg(spriteEl, Assets.partyFront(GameState.state.partyStage));
        spriteEl.classList.add('evolution-sprite-reveal');
        if (isFinal) spriteEl.classList.add('evolution-sprite-mega');

        await wait(450);
        flashEl.classList.remove('evolution-flash-active');

        await DialogueEngine.typeInto(textEl, announceText || `${GameState.partyLabel()} evolved!`);
        await Input.waitForAdvance();

        const done = onDoneCallback;
        onDoneCallback = null;
        if (done) done();
      },
    });
  }

  return { init, startFor };
})();
window.Evolution = Evolution;
