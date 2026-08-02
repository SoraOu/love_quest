/* =========================================================
   LOVE QUEST — boot.js
   Owns the whole opening sequence: boot screen (2.1) ->
   name reveal (2.2) -> intro dialogue (2.4). These three
   scenes are one continuous flow with no game-state of their
   own to track elsewhere, so they share this one file rather
   than getting three separate modules.

   Chapter 3's map.js takes over once the intro dialogue ends.
   ========================================================= */

const Boot = (function () {
  'use strict';

  const BOOT_ANIM_MS = 1400; // keep in rough sync with the CSS fade-in duration

  let bootState = 'idle'; // 'animating' | 'ready'
  let bootAnimTimer = null;
  let musicStarted = false; // gate so GameAudio.play('boot') only ever fires once, on the first press

  let titleEl, subtitleEl, pressStartEl, versionEl;
  let nameRevealEl;
  let mudkipEl;

  function queryElements() {
    titleEl = document.querySelector('#boot .boot-title');
    subtitleEl = document.querySelector('#boot .boot-subtitle');
    pressStartEl = document.querySelector('#boot .press-start');
    versionEl = document.querySelector('#boot .boot-version');
    nameRevealEl = document.querySelector('#name-reveal .name-reveal-text');
    mudkipEl = document.querySelector('#intro .sprite-mudkip');
  }

  function wait(ms) {
    return new Promise((resolve) => window.setTimeout(resolve, ms));
  }

  // --- Scene: boot -----------------------------------------------------
  function registerBootScene() {
    SceneManager.register('boot', {
      onEnter() {
        bootState = 'animating';
        subtitleEl.textContent = StoryData.boot.subtitle;
        versionEl.textContent = StoryData.boot.version;
        pressStartEl.textContent = 'PRESS START';

        titleEl.classList.remove('boot-title-visible');
        pressStartEl.classList.remove('press-start-visible');

        // force reflow so the animation restarts if we ever re-enter this scene
        void titleEl.offsetWidth;
        titleEl.classList.add('boot-title-visible');

        bootAnimTimer = window.setTimeout(() => {
          bootState = 'ready';
          pressStartEl.classList.add('press-start-visible');
        }, BOOT_ANIM_MS);
      },
      onLeave() {
        window.clearTimeout(bootAnimTimer);
      },
      onInput(action) {
        if (action !== 'advance') return;

        // Browsers block audio.play() until it's triggered by a real user
        // gesture — this onInput handler IS that gesture (a click/key
        // press), so starting music here (instead of in onEnter, which
        // fires automatically with no user action behind it) satisfies
        // that requirement and starts the overall track right after
        // Start is pressed, exactly once.
        if (!musicStarted) {
          musicStarted = true;
          GameAudio.play('boot');
        }

        if (bootState === 'animating') {
          // First press: skip straight to the "ready" state instead of advancing.
          window.clearTimeout(bootAnimTimer);
          titleEl.classList.add('boot-title-visible');
          pressStartEl.classList.add('press-start-visible');
          bootState = 'ready';
          return;
        }

        if (bootState === 'ready') {
          // Second press: actually advance.
          SceneManager.go('name-reveal');
        }
      },
    });
  }

  // --- Scene: name-reveal ------------------------------------------------
  function registerNameRevealScene() {
    SceneManager.register('name-reveal', {
      async onEnter() {
        nameRevealEl.textContent = '';
        GameAudio.play('name-reveal');
        await DialogueEngine.typeInto(nameRevealEl, StoryData.intro.nameRevealText);
        await Input.waitForAdvance();
        SceneManager.go('intro');
      },
    });
  }

  // --- Scene: intro --------------------------------------------------
  function registerIntroScene() {
    SceneManager.register('intro', {
      async onEnter() {
        GameAudio.play('intro');

        // Mudkip walks on: retrigger the CSS animation each time we enter.
        Assets.setBg(mudkipEl, Assets.partyFront('mudkip'));
        mudkipEl.classList.remove('sprite-walk-in');
        void mudkipEl.offsetWidth;
        mudkipEl.classList.add('sprite-walk-in');
        await wait(600);

        const lines = StoryData.intro.openingLines && StoryData.intro.openingLines.length
          ? StoryData.intro.openingLines
          : [StoryData.intro.openingLine];

        await DialogueEngine.run({
          speaker: 'MUDKIP',
          lines,
        });

        // Hand off to the world map now that Chapter 3's map.js is wired up.
        SceneManager.go('map');
      },
    });
  }

  function init() {
    queryElements();
    registerBootScene();
    registerNameRevealScene();
    registerIntroScene();
  }

  return { init };
})();

window.Boot = Boot;
