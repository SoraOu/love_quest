/* =========================================================
   LOVE QUEST — sceneManager.js
   The backbone every screen plugs into. Same pattern the old
   build used (it worked) — cleaned up so every scene module
   follows it consistently. No scene should invent its own
   show/hide logic; it registers with SceneManager instead.
   ========================================================= */

const SceneManager = (function () {
  'use strict';

  /** @type {Record<string, HTMLElement>} */
  const scenes = {};

  /** @type {Record<string, { onEnter?: Function, onLeave?: Function }>} */
  const registry = {};

  let currentSceneId = null;
  let rootEl = null;
  let transitioning = false;

  const FADE_MS = 240; // keep in sync with --t-med in style.css

  /**
   * Wire up the manager against the #game-root container.
   * Call once from boot.js / main.js before any scene work happens.
   */
  function init(rootSelector) {
    rootEl = document.querySelector(rootSelector || '#game-root');
    if (!rootEl) {
      console.error('[SceneManager] root element not found:', rootSelector);
      return;
    }
    rootEl.querySelectorAll('.scene').forEach((el) => {
      const id = el.dataset.scene;
      if (!id) {
        console.warn('[SceneManager] .scene element missing data-scene id', el);
        return;
      }
      scenes[id] = el;
    });
  }

  /**
   * Register a scene's lifecycle hooks. Every scene module
   * (boot.js, chapter.js, battle.js, etc.) calls this once.
   * @param {string} id - must match the element's data-scene attribute
   * @param {{ onEnter?: Function, onLeave?: Function, onInput?: Function }} hooks
   *   onInput(action) receives 'advance' | 'up' | 'down' | 'left' | 'right'
   *   from input.js whenever nothing has claimed the press directly
   *   (e.g. DialogueEngine mid-line). Optional — most scenes don't need it.
   */
  function register(id, hooks) {
    if (!scenes[id]) {
      console.warn(`[SceneManager] register() called for unknown scene "${id}". ` +
        'Make sure a matching <div class="scene" data-scene="' + id + '"> exists before init().');
    }
    registry[id] = hooks || {};
  }

  /**
   * Transition to a scene by id. Runs the current scene's onLeave,
   * then fades the previous scene out and the next one in at the
   * same time (true cross-fade — no blank gap between them), then
   * runs the next scene's onEnter.
   * @param {string} id
   * @param {*} [payload] - optional data forwarded to onEnter
   */
  function go(id, payload) {
    if (!scenes[id]) {
      console.error(`[SceneManager] go("${id}") — no scene with that id is registered.`);
      return;
    }
    if (transitioning) return;
    if (id === currentSceneId) return;

    transitioning = true;
    const prevId = currentSceneId;
    const prevEl = prevId ? scenes[prevId] : null;
    const nextEl = scenes[id];

    const leaveHook = prevId && registry[prevId] && registry[prevId].onLeave;
    if (leaveHook) leaveHook();

    currentSceneId = id;

    if (prevEl) {
      prevEl.classList.add('fade-out');
      prevEl.classList.remove('active');
    }

    // Set up the next scene's content BEFORE it starts becoming visible,
    // so nothing stale/blank is on screen as its opacity ramps up.
    const enterHook = registry[id] && registry[id].onEnter;
    if (enterHook) enterHook(payload);

    nextEl.classList.add('active');

    // Small delay just lets the fade-out transition finish and clears
    // its class; the actual visual cross-fade already started above.
    window.setTimeout(() => {
      if (prevEl) prevEl.classList.remove('fade-out');
      transitioning = false;
    }, prevEl ? FADE_MS : 0);
  }

  /** Returns the id of the currently active scene. */
  function current() {
    return currentSceneId;
  }

  /**
   * Forward an input action to the active scene's onInput hook, if any.
   * Called by input.js — scene modules never listen for keys/clicks directly.
   * @param {'advance'|'up'|'down'|'left'|'right'} action
   */
  function handleInput(action) {
    if (transitioning || !currentSceneId) return;
    const hook = registry[currentSceneId] && registry[currentSceneId].onInput;
    if (hook) hook(action);
  }

  return { init, register, go, current, handleInput };
})();

window.SceneManager = SceneManager;
