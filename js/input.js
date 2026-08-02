/* =========================================================
   LOVE QUEST — input.js  (Chapter 2.5)
   ONE clean keyboard/click handler. Nothing else in the
   codebase should attach its own document-level key listener.

   Two ways consumers get input:
   1. A scene registers an `onInput(action)` hook with
      SceneManager — used for things like the boot screen's
      "press to skip / press to advance" state machine.
   2. Code that's actively waiting on the *next* press (like
      DialogueEngine mid-line) calls setAdvanceHandler() /
      waitForAdvance() to intercept the very next advance,
      bypassing the scene-level hook until it's done.
   ========================================================= */

const Input = (function () {
  'use strict';

  const ADVANCE_KEYS = new Set(['Enter', ' ', 'Spacebar', 'z', 'Z']);
  const DIRECTION_KEYS = {
    ArrowUp: 'up',
    ArrowDown: 'down',
    ArrowLeft: 'left',
    ArrowRight: 'right',
  };

  /** @type {Function|null} one-shot/ongoing override for the next advance press */
  let advanceHandler = null;
  let initialized = false;

  function init() {
    if (initialized) return; // guard against double-init
    initialized = true;
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('click', onClick);
  }

  function onKeyDown(e) {
    if (ADVANCE_KEYS.has(e.key)) {
      e.preventDefault();
      dispatch('advance');
      return;
    }
    const dir = DIRECTION_KEYS[e.key];
    if (dir) {
      e.preventDefault();
      dispatch(dir);
    }
  }

  function onClick() {
    // A plain click anywhere always means "advance." Elements that need
    // their own click behavior (choice buttons, map regions) call
    // event.stopPropagation() so this fallback doesn't also fire.
    dispatch('advance');
  }

  function dispatch(action) {
    if (action === 'advance' && advanceHandler) {
      advanceHandler();
      return;
    }
    if (window.SceneManager && typeof SceneManager.handleInput === 'function') {
      SceneManager.handleInput(action);
    }
  }

  /** Intercept the next advance press(es) with a custom handler. */
  function setAdvanceHandler(fn) {
    advanceHandler = fn;
  }

  /** Release the override so advance presses fall back to the active scene's onInput. */
  function clearAdvanceHandler() {
    advanceHandler = null;
  }

  /** Convenience: resolves the next time the player presses advance. */
  function waitForAdvance() {
    return new Promise((resolve) => {
      setAdvanceHandler(() => {
        clearAdvanceHandler();
        resolve();
      });
    });
  }

  return { init, setAdvanceHandler, clearAdvanceHandler, waitForAdvance };
})();

window.Input = Input;
