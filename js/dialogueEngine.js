/* =========================================================
   LOVE QUEST — dialogueEngine.js  (Chapter 2.3, typewriter
   utility referenced by 2.2)

   Two things live here:

   1. `typeInto(el, text, opts)` — a generic typewriter utility.
      Types text into ANY element, character by character, with
      the same feel everywhere it's used: chapter titles, quiz
      feedback, name reveal, etc. Not a one-off.

   2. `DialogueEngine` — drives the SINGLE `.dialogue-box`
      element that lives once in index.html (outside every
      `.scene`). Every scene that needs dialogue calls
      DialogueEngine.run(...); nothing copy-pastes dialogue
      box markup into its own scene.

   Both read timing from one constant so the "typing speed"
   feel is tuned in exactly one place, both resolve the
   `{mudkipName}` token via GameState.applyTemplate() before
   typing, and both play a soft blip (GameAudio.playSfx) on
   every non-whitespace character so the two typewriters keep
   sounding identical, not just looking identical.
   ========================================================= */

const CHAR_MS = 28; // ms per character — shared by typeInto and DialogueEngine

/** Typewriter blip disabled — kept as a no-op so call sites don't need to change. */
function playTypeBlip(char) {
  // no-op: typing sound effect removed
}

/** Resolves {mudkipName} (and any future tokens) before a string is typed out. Safe to call even if GameState isn't ready yet. */
function resolveText(text) {
  return (window.GameState && typeof GameState.applyTemplate === 'function')
    ? GameState.applyTemplate(text)
    : text;
}

/**
 * Types `text` into `el` one character at a time. Pressing
 * advance mid-type skips straight to the full string.
 * @param {HTMLElement} el
 * @param {string} text
 * @param {{ speed?: number }} [opts]
 * @returns {Promise<void>}
 */
function typeInto(el, text, opts) {
  const speed = (opts && opts.speed) || CHAR_MS;
  const resolved = resolveText(text);
  return new Promise((resolve) => {
    let i = 0;
    let typing = true;
    let timer = null;

    function finish() {
      typing = false;
      window.clearTimeout(timer);
      el.textContent = resolved;
      Input.clearAdvanceHandler();
      resolve();
    }

    function tick() {
      if (!typing) return;
      i++;
      el.textContent = resolved.slice(0, i);
      playTypeBlip(resolved[i - 1]);
      if (i >= resolved.length) {
        finish();
        return;
      }
      timer = window.setTimeout(tick, speed);
    }

    Input.setAdvanceHandler(() => {
      if (typing) finish();
    });

    tick();
  });
}

const DialogueEngine = (function () {
  'use strict';

  let boxEl, speakerEl, textEl, cursorEl, continueEl, choicesEl;
  let mounted = false;

  /** 'idle' | 'typing' | 'waiting' */
  let lineState = 'idle';
  let charTimer = null;
  let skipToEnd = null;
  let resolveLine = null;

  function mount() {
    if (mounted) return;
    boxEl = document.querySelector('.dialogue-box');
    if (!boxEl) {
      console.error('[DialogueEngine] no .dialogue-box found in the DOM.');
      return;
    }
    speakerEl = boxEl.querySelector('.dialogue-speaker');
    textEl = boxEl.querySelector('.dialogue-text-content');
    cursorEl = boxEl.querySelector('.dialogue-cursor');
    continueEl = boxEl.querySelector('.dialogue-continue');
    choicesEl = boxEl.querySelector('.dialogue-choices');
    boxEl.classList.add('hidden');
    mounted = true;
  }

  function show() {
    boxEl.classList.remove('hidden');
  }

  function hide() {
    boxEl.classList.add('hidden');
  }

  /** Types a single line into the shared dialogue box, resolves when the player advances past it. */
  function runLine(text) {
    const resolved = resolveText(text);
    return new Promise((resolve) => {
      lineState = 'typing';
      let i = 0;
      textEl.textContent = '';
      cursorEl.style.display = '';
      continueEl.classList.remove('visible');

      function finishTyping() {
        window.clearTimeout(charTimer);
        textEl.textContent = resolved;
        cursorEl.style.display = 'none';
        continueEl.classList.add('visible');
        lineState = 'waiting';
      }

      function tick() {
        if (lineState !== 'typing') return;
        i++;
        textEl.textContent = resolved.slice(0, i);
        playTypeBlip(resolved[i - 1]);
        if (i >= resolved.length) {
          finishTyping();
          return;
        }
        charTimer = window.setTimeout(tick, CHAR_MS);
      }

      skipToEnd = finishTyping;
      resolveLine = resolve;
      tick();
    });
  }

  /** Renders choice buttons and resolves with whichever the player clicks. */
  function runChoices(choices) {
    return new Promise((resolve) => {
      continueEl.classList.remove('visible');
      choicesEl.innerHTML = '';
      choices.forEach((choice, idx) => {
        const btn = document.createElement('button');
        btn.className = 'dialogue-choice-btn';
        btn.type = 'button';
        btn.textContent = choice.label || '';
        btn.addEventListener('click', (e) => {
          e.stopPropagation(); // don't also trigger the global click->advance
          choicesEl.innerHTML = '';
          resolve(choice.value !== undefined ? choice.value : idx);
        });
        choicesEl.appendChild(btn);
      });
    });
  }

  /** The advance handler active only while DialogueEngine.run() is in flight. */
  function handleAdvance() {
    if (lineState === 'typing') {
      if (skipToEnd) skipToEnd();
      return;
    }
    if (lineState === 'waiting') {
      lineState = 'idle';
      const resolve = resolveLine;
      resolveLine = null;
      if (resolve) resolve();
    }
  }

  /**
   * Runs a full dialogue sequence in the shared box: speaker name,
   * each line in order (typed out, advance to continue), then
   * optional branching choices at the end.
   * @param {{ speaker?: string, lines: string[], choices?: {label:string, value?:*}[] }} options
   * @returns {Promise<*>} resolves with the chosen value (if choices given) or undefined
   */
  async function run(options) {
    if (!mounted) mount();
    const { speaker = '', lines = [''], choices = null } = options;

    show();
    speakerEl.textContent = speaker;
    Input.setAdvanceHandler(handleAdvance);

    for (const line of lines) {
      await runLine(line);
    }

    let result;
    if (choices && choices.length) {
      Input.clearAdvanceHandler(); // choices are click-driven, not advance-driven
      result = await runChoices(choices);
    }

    Input.clearAdvanceHandler();
    hide();
    return result;
  }

  return { mount, run, typeInto };
})();

window.DialogueEngine = DialogueEngine;