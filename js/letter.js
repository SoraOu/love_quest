/* =========================================================
   LOVE QUEST — letter.js  (Chapter 4.4, 4.5, 4.6)
   Owns the love letter reveal, hands off to Evolution.js for
   the Swampert->Mega Swampert final reveal (4.5 — same flash/
   swap/glow mechanic as every other evolution, just the last
   and biggest one), then lands on the finale scene.

   The finale scene shows every Pokémon sprite from the journey
   lined up along the bottom (buildLineup()) with the Mudkip
   evolution line front-and-center, her portrait as static
   ASCII art (js/asciiArt.js) flashed into a bordered frame at
   center screen (same flash-then-reveal trick as
   Evolution.js's .evolution-flash, just scoped to the ascii
   frame — see flashInAscii() below), a toggle button that
   flash-swaps that art for a lightly pixelated render of the
   real photo (js/pixelPhoto.js), and the two hidden easter eggs
   (4.6), one of which reuses the ascii art.

   Entered via Letter.start(), called by quiz.js once the
   mystery-reveal sequence finishes. This is the end of the
   game — nothing hands off anywhere after the finale scene.
   ========================================================= */

const Letter = (function () {
  'use strict';

  let bodyEl, signoffEl, spriteEl;
  let finaleTextEl, finaleAsciiEl, finaleAsciiFlashEl, finaleLineupEl, bookshelfBtn, posterBtn;
  let finaleFrameEl, finalePhotoEl, finaleViewToggleBtn;
  let secretOverlayEl, secretAsciiWrapEl, secretAsciiEl, secretAsciiFlashEl, secretTextEl, secretLinkEl, secretContinueBtn;

  // Which view the finale centerpiece is on right now — reset to false
  // (ascii) every time the finale scene is (re-)entered, see runFinale().
  let showingPhoto = false;
  let photoRendered = false;

  // The Mudkip evolution line, in order — the center of the finale
  // lineup. Uses Assets.partyFront() (same lookup as every other party
  // sprite in the game) rather than hardcoded dex numbers, so it stays
  // correct if StoryData.assets.partyStageSprites ever changes.
  const MUDKIP_LINE_STAGES = ['mudkip', 'marshtomp', 'swampert', 'mega-swampert'];

  function mount() {
    bodyEl = document.querySelector('#letter .letter-body');
    signoffEl = document.querySelector('#letter .letter-signoff');
    spriteEl = document.querySelector('#letter .letter-sprite');

    finaleTextEl = document.querySelector('#finale .finale-reveal-text');
    finaleFrameEl = document.querySelector('#finale .finale-ascii-frame');
    finaleAsciiEl = document.querySelector('#finale .finale-ascii');
    finalePhotoEl = document.querySelector('#finale .finale-photo');
    finaleAsciiFlashEl = document.querySelector('#finale .finale-ascii-flash');
    finaleViewToggleBtn = document.querySelector('#finale .finale-view-toggle');
    finaleLineupEl = document.querySelector('#finale .finale-lineup');
    bookshelfBtn = document.querySelector('.easter-egg-bookshelf');
    posterBtn = document.querySelector('.easter-egg-poster');

    finaleViewToggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleFinaleView();
    });

    secretOverlayEl = document.querySelector('.secret-overlay');
    secretAsciiWrapEl = secretOverlayEl.querySelector('.secret-ascii-wrap');
    secretAsciiEl = secretOverlayEl.querySelector('.secret-ascii');
    secretAsciiFlashEl = secretOverlayEl.querySelector('.secret-ascii-flash');
    secretTextEl = secretOverlayEl.querySelector('.secret-text');
    secretLinkEl = secretOverlayEl.querySelector('.secret-link');
    secretContinueBtn = secretOverlayEl.querySelector('.secret-continue');

    // Bookshelf easter egg — her portrait, as the same static ASCII art
    // (js/asciiArt.js) used in the finale, flashed straight in.
    bookshelfBtn.addEventListener('click', async (e) => {
      e.stopPropagation();
      showSecret({ ascii: AsciiArt.PORTRAIT });
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

  function wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Scales a <pre> of ASCII art down (never up) via CSS transform so a
   * fixed-size art grid (js/asciiArt.js) always fits inside its frame,
   * whatever the frame's box happens to be — instead of relying on a
   * flat font-size guess. Reset transform first so the measurement is
   * always against the pre's natural, unscaled size.
   */
  function fitAsciiToFrame(preEl, frameEl) {
    preEl.style.transform = 'none';
    const availWidth = frameEl.clientWidth;
    const availHeight = frameEl.clientHeight || frameEl.clientWidth;
    const naturalWidth = preEl.scrollWidth;
    const naturalHeight = preEl.scrollHeight;
    if (!naturalWidth || !naturalHeight || !availWidth) return;

    const scale = Math.min(availWidth / naturalWidth, availHeight / naturalHeight, 1);
    preEl.style.transform = `scale(${scale})`;
  }

  /**
   * Flash-then-reveal an ASCII art string into a <pre> — same white-flash
   * -covers-the-swap mechanic as Evolution.js's .evolution-flash, just
   * scoped to whichever frame is passed in. Used by both the finale
   * centerpiece and the bookshelf easter egg, since they show the same
   * static art (js/asciiArt.js) rather than converting a photo live.
   */
  async function flashInAscii(preEl, flashEl, frameEl, text) {
    flashEl.classList.add('ascii-flash-active');
    await wait(150);
    preEl.textContent = text;
    fitAsciiToFrame(preEl, frameEl);
    await wait(200);
    flashEl.classList.remove('ascii-flash-active');
  }

  /**
   * Chapter 4.6 — single reusable popup for both hidden easter eggs.
   * @param {{ message?: string, url?: string, ascii?: string }} [content]
   */
  async function showSecret(content) {
    content = content || {};
    secretTextEl.textContent = content.message || '';

    if (typeof content.ascii === 'string' && content.ascii) {
      secretAsciiWrapEl.classList.remove('hidden');
      secretOverlayEl.classList.remove('hidden');
      await flashInAscii(secretAsciiEl, secretAsciiFlashEl, secretAsciiWrapEl, content.ascii);
    } else {
      secretAsciiEl.textContent = '';
      secretAsciiWrapEl.classList.add('hidden');
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

  /**
   * Toggle button (Chapter 4.6 add-on) — flash-swaps the finale
   * centerpiece between the static ascii art and a lightly pixelated
   * render of the real photo (js/pixelPhoto.js), reusing the same
   * flash overlay/timing as flashInAscii() above so it feels like the
   * same trick, not a different UI. Renders the photo into the canvas
   * lazily, once, the first time it's needed.
   */
  async function toggleFinaleView() {
    finaleViewToggleBtn.disabled = true;

    if (!showingPhoto && !photoRendered) {
      const ok = await PixelPhoto.render(finalePhotoEl, Assets.portraitImg(), { targetWidth: 700 });
      if (!ok) {
        // Photo hasn't been dropped into assets/portrait.jpg yet — nothing
        // to switch to, leave the ascii art up.
        finaleViewToggleBtn.disabled = false;
        return;
      }
      photoRendered = true;
    }

    finaleAsciiFlashEl.classList.add('ascii-flash-active');
    await wait(150);

    showingPhoto = !showingPhoto;
    finaleAsciiEl.classList.toggle('hidden', showingPhoto);
    finalePhotoEl.classList.toggle('hidden', !showingPhoto);
    finaleViewToggleBtn.textContent = showingPhoto ? 'VIEW ASCII' : 'VIEW PHOTO';

    await wait(200);
    finaleAsciiFlashEl.classList.remove('ascii-flash-active');
    finaleViewToggleBtn.disabled = false;
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

  /**
   * Builds the bottom-of-screen Pokémon lineup: every cameo sprite in
   * StoryData.assets.finaleLineupSprites split evenly left/right around
   * the Mudkip evolution line, which sits in the center (bigger, glowing)
   * as the finale's stars. Pure DOM build — no animation, so it's safe
   * to call every time the finale scene is entered.
   */
  function buildLineup() {
    if (!finaleLineupEl) return;
    finaleLineupEl.innerHTML = '';

    const makeIcon = (src, isCenter) => {
      const el = document.createElement('div');
      el.className = isCenter ? 'finale-lineup-icon finale-lineup-icon-center' : 'finale-lineup-icon';
      Assets.setBg(el, src);
      return el;
    };

    const cameos = StoryData.assets.finaleLineupSprites || [];
    const mid = Math.ceil(cameos.length / 2);
    const left = cameos.slice(0, mid);
    const right = cameos.slice(mid);

    left.forEach((p) => finaleLineupEl.appendChild(makeIcon(Assets.pokemonFront(p.dex, p.ext))));
    MUDKIP_LINE_STAGES.forEach((stage) => finaleLineupEl.appendChild(makeIcon(Assets.partyFront(stage), true)));
    right.forEach((p) => finaleLineupEl.appendChild(makeIcon(Assets.pokemonFront(p.dex, p.ext))));
  }

  /** Chapter 4.5 tie-in / 4.6 — the finale scene, entered only after the Mega reveal resolves. */
  async function runFinale() {
    buildLineup();

    // Reset to the ascii view every time the finale is (re-)entered.
    showingPhoto = false;
    photoRendered = false;
    finaleAsciiEl.classList.remove('hidden');
    finalePhotoEl.classList.add('hidden');
    finaleViewToggleBtn.textContent = 'VIEW PHOTO';

    finaleTextEl.textContent = '';
    finaleAsciiEl.textContent = '';

    await DialogueEngine.typeInto(finaleTextEl, StoryData.finalReveal.revealText);

    // Centerpiece — the static portrait art (js/asciiArt.js), flashed
    // straight in rather than converted from a photo live.
    await flashInAscii(finaleAsciiEl, finaleAsciiFlashEl, finaleFrameEl, AsciiArt.PORTRAIT);
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
