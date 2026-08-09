/* =========================================================
   LOVE QUEST — letter.js  (Chapter 4.4, 4.5, 4.6)
   Owns the love letter reveal, hands off to Evolution.js for
   the Swampert->Mega Swampert final reveal (4.5 — same flash/
   swap/glow mechanic as every other evolution, just the last
   and biggest one), then lands on the finale scene that holds
   the two hidden easter eggs (4.6).

   Entered via Letter.start(), called by quiz.js once the
   mystery-reveal sequence finishes. This is the end of the
   game — nothing hands off anywhere after the finale scene.
   ========================================================= */

const Letter = (function () {
  'use strict';

  let bodyEl, signoffEl, spriteEl;
  let finaleTextEl, finaleSpriteEl, bookshelfBtn, posterBtn;
  let secretOverlayEl, secretAsciiEl, secretTextEl, secretLinkEl, secretContinueBtn;

  function mount() {
    bodyEl = document.querySelector('#letter .letter-body');
    signoffEl = document.querySelector('#letter .letter-signoff');
    spriteEl = document.querySelector('#letter .letter-sprite');

    finaleTextEl = document.querySelector('#finale .finale-reveal-text');
    finaleSpriteEl = document.querySelector('#finale .finale-sprite');
    bookshelfBtn = document.querySelector('.easter-egg-bookshelf');
    posterBtn = document.querySelector('.easter-egg-poster');

    secretOverlayEl = document.querySelector('.secret-overlay');
    secretAsciiEl = secretOverlayEl.querySelector('.secret-ascii');
    secretTextEl = secretOverlayEl.querySelector('.secret-text');
    secretLinkEl = secretOverlayEl.querySelector('.secret-link');
    secretContinueBtn = secretOverlayEl.querySelector('.secret-continue');

    // Bookshelf easter egg — her photo, rendered as a picture made of
    // text (see js/textArt.js). Opens right away instead of waiting on
    // the render, so it never feels stuck; art fills in a beat later.
    bookshelfBtn.addEventListener('click', async (e) => {
      e.stopPropagation();
      showSecret({ ascii: '' });
      const art = await TextArt.renderFromImage(Assets.portraitImg(), { cols: 70 });
      if (art) {
        secretAsciiEl.textContent = art;
        secretAsciiEl.classList.remove('hidden');
      } else {
        // Photo hasn't been dropped into assets/portrait.jpg yet —
        // fall back to the plain message so the button still does something.
        showSecret({ message: StoryData.easterEggs.bookshelfMessage });
      }
    });
    posterBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      showSecret({ url: StoryData.easterEggs.playlistUrl });
    });
    secretContinueBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      secretOverlayEl.classList.add('hidden');
    });
  }

  /**
   * Chapter 4.6 — single reusable popup for both hidden easter eggs.
   * @param {{ message?: string, url?: string, ascii?: string }} [content]
   */
  function showSecret(content) {
    content = content || {};
    secretTextEl.textContent = content.message || '';

    if (typeof content.ascii === 'string') {
      secretAsciiEl.textContent = content.ascii;
      secretAsciiEl.classList.remove('hidden');
    } else {
      secretAsciiEl.textContent = '';
      secretAsciiEl.classList.add('hidden');
    }

    if (content.url) {
      secretLinkEl.href = content.url;
      secretLinkEl.classList.remove('hidden');
    } else {
      secretLinkEl.removeAttribute('href');
      secretLinkEl.classList.add('hidden');
    }
    secretOverlayEl.classList.remove('hidden');
  }

  /** Chapter 4.4 — typewriter-style reveal using the Chapter 2 dialogue engine's typeInto utility. */
  async function runLetter() {
    Assets.setBg(spriteEl, Assets.partyFront(GameState.state.partyStage));
    bodyEl.textContent = '';
    signoffEl.textContent = '';

    await DialogueEngine.typeInto(bodyEl, StoryData.letter.body);
    await Input.waitForAdvance();

    await DialogueEngine.typeInto(signoffEl, StoryData.letter.signOff);
    await Input.waitForAdvance();

    // Hand off to the shared Evolution scene for the final Swampert->Mega
    // reveal (4.5), then land on the finale scene once that resolves.
    Evolution.startFor(5, () => SceneManager.go('finale'));
  }

  /** Chapter 4.5 tie-in / 4.6 — the finale scene, entered only after the Mega reveal resolves. */
  async function runFinale() {
    Assets.setBg(finaleSpriteEl, Assets.partyFront(GameState.state.partyStage));
    finaleTextEl.textContent = '';
    await DialogueEngine.typeInto(finaleTextEl, StoryData.finalReveal.revealText);
  }

  /** Called by quiz.js once the mystery-reveal sequence finishes. */
  function start() {
    SceneManager.go('letter');
  }

  function init() {
    mount();
    SceneManager.register('letter', {
      onEnter() {
        GameAudio.play('letter');
        runLetter();
      },
    });
    SceneManager.register('finale', {
      onEnter() {
        GameAudio.play('finale');
        runFinale();
      },
    });
  }

  return { init, start };
})();
window.Letter = Letter;
