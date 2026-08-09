/* =========================================================
   LOVE QUEST — boot.js
   Owns the whole opening sequence: boot screen (2.1) ->
   name reveal (2.2) -> intro dialogue (2.4) -> nickname
   prompt (2.4 add-on). These four beats are one continuous
   flow with no game-state of their own to track elsewhere
   (besides the nickname, handed straight to GameState), so
   they share this one file rather than getting separate
   modules.

   Chapter 3's map.js takes over once the nickname is set.
   ========================================================= */

const Boot = (function () {
  'use strict';

  const BOOT_ANIM_MS = 1400; // keep in rough sync with the CSS fade-in duration
  const DEBUG_SKIP_CODE = 'lara';

  let bootState = 'idle'; // 'animating' | 'ready'
  let bootAnimTimer = null;
  let musicStarted = false; // gate so GameAudio.play('boot') only ever fires once, on the first press
  let debugSkipBuffer = '';

  let titleEl, subtitleEl, pressStartEl, versionEl;
  let nameRevealEl;
  let mudkipEl;
  let nicknameOverlayEl, nicknamePromptEl, nicknameInputEl, nicknameConfirmBtn;

  function queryElements() {
    titleEl = document.querySelector('#boot .boot-title');
    subtitleEl = document.querySelector('#boot .boot-subtitle');
    pressStartEl = document.querySelector('#boot .press-start');
    versionEl = document.querySelector('#boot .boot-version');
    nameRevealEl = document.querySelector('#name-reveal .name-reveal-text');
    mudkipEl = document.querySelector('#intro .sprite-mudkip');

    nicknameOverlayEl = document.querySelector('.nickname-overlay');
    nicknamePromptEl = nicknameOverlayEl.querySelector('.nickname-prompt');
    nicknameInputEl = nicknameOverlayEl.querySelector('.nickname-input');
    nicknameConfirmBtn = nicknameOverlayEl.querySelector('.nickname-confirm');

    // Same reasoning as quiz.js's input: typing/clicking in the field
    // (including pressing Enter) shouldn't also fall through to
    // input.js's document-level "any click/Enter = advance" fallback.
    nicknameInputEl.addEventListener('click', (e) => e.stopPropagation());
  }

  function wait(ms) {
    return new Promise((resolve) => window.setTimeout(resolve, ms));
  }

  /**
   * Dev-only shortcut: type "lara" (no Enter needed, case-insensitive)
   * while sitting on the boot screen to skip straight to the Ch.4
   * letter/finale flow, bypassing map/chapters/quiz entirely. No GUI
   * for it anywhere — it's just this listener, only live while the
   * boot scene is active. Handy for checking letter/finale changes
   * without replaying the whole game each time.
   */
  function onDebugSkipKeydown(e) {
    if (e.key.length !== 1) return; // ignore Shift/Enter/arrows/etc.
    debugSkipBuffer = (debugSkipBuffer + e.key.toLowerCase()).slice(-DEBUG_SKIP_CODE.length);
    if (debugSkipBuffer === DEBUG_SKIP_CODE) {
      debugSkipBuffer = '';
      skipToLetterScene();
    }
  }

  function skipToLetterScene() {
    window.clearTimeout(bootAnimTimer);
    // Set the party to 'swampert' first so the finale's own evolve()
    // call lands on 'mega-swampert', same as it would after a real
    // playthrough, instead of skipping there from 'mudkip'.
    GameState.state.partyStage = 'swampert';
    if (!GameState.state.mudkipNickname) {
      GameState.setNickname(StoryData.intro.nicknameDefault);
    }
    Letter.start();
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

        debugSkipBuffer = '';
        document.addEventListener('keydown', onDebugSkipKeydown);
      },
      onLeave() {
        window.clearTimeout(bootAnimTimer);
        document.removeEventListener('keydown', onDebugSkipKeydown);
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

  /**
   * Chapter 2.4 add-on — asks the player to nickname their Mudkip
   * partner right after the intro dialogue finishes. Same reusable-
   * overlay pattern as the item-get/secret overlays. Resolves with
   * the trimmed name the player typed, or StoryData.intro.nicknameDefault
   * if they confirm with the field left blank.
   * @returns {Promise<string>}
   */
  function promptNickname() {
    return new Promise((resolve) => {
      nicknamePromptEl.textContent = StoryData.intro.nicknamePrompt;
      nicknameInputEl.value = '';
      nicknameOverlayEl.classList.remove('hidden');
      nicknameInputEl.focus();

      function finish() {
        const typed = nicknameInputEl.value.trim();
        nicknameOverlayEl.classList.add('hidden');
        nicknameConfirmBtn.removeEventListener('click', onConfirmClick);
        nicknameInputEl.removeEventListener('keydown', onKeydown);
        resolve(typed || StoryData.intro.nicknameDefault);
      }

      function onConfirmClick(e) {
        e.stopPropagation();
        finish();
      }

      function onKeydown(e) {
        e.stopPropagation();
        if (e.key === 'Enter') {
          e.preventDefault();
          finish();
        }
      }

      nicknameConfirmBtn.addEventListener('click', onConfirmClick);
      nicknameInputEl.addEventListener('keydown', onKeydown);
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

        const nickname = await promptNickname();
        GameState.setNickname(nickname);

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