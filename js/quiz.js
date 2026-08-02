/* =========================================================
   LOVE QUEST — quiz.js  (Chapter 4.1, 4.2, 4.3)
   Owns the whole quiz-gate flow: the wooden-gate quiz screen
   itself (5 clues read in a loop from StoryData.quiz.clues),
   and the mystery-reveal scene the last correct answer hands
   off to. Bundled together for the same reason boot.js bundles
   boot/name-reveal/intro — one continuous beat, no separate
   game-state to track elsewhere.

   Entered via Quiz.start(), called by map.js when the player
   clicks "Summit of Firsts" (the one location with no chapter/
   battle of its own). Hands off to Letter.start() at the end.
   ========================================================= */

const Quiz = (function () {
  'use strict';

  let gateEl, progressEl, inscriptionEl, questionEl, inputEl, submitBtn, feedbackEl;
  let mysteryCluesEl, mysteryTextEl;

  let clueIndex = 0;
  let busy = false;

  function mount() {
    gateEl = document.querySelector('#quiz .quiz-gate');
    progressEl = gateEl.querySelector('.quiz-progress');
    inscriptionEl = gateEl.querySelector('.quiz-inscription');
    questionEl = gateEl.querySelector('.quiz-question');
    inputEl = gateEl.querySelector('.quiz-input');
    submitBtn = gateEl.querySelector('.quiz-submit');
    feedbackEl = gateEl.querySelector('.quiz-feedback');

    mysteryCluesEl = document.querySelector('#mystery-reveal .mystery-clues');
    mysteryTextEl = document.querySelector('#mystery-reveal .mystery-text');

    submitBtn.addEventListener('click', (e) => {
      e.stopPropagation(); // this is a deliberate submit, not the global advance-click
      checkAnswer();
    });

    // The input needs its own click/keydown handling so typing an answer
    // (including pressing Enter to submit) doesn't also fall through to
    // input.js's document-level "any click/Enter = advance" fallback.
    inputEl.addEventListener('click', (e) => e.stopPropagation());
    inputEl.addEventListener('keydown', (e) => {
      e.stopPropagation();
      if (e.key === 'Enter') {
        e.preventDefault();
        checkAnswer();
      }
    });
  }

  function wait(ms) {
    return new Promise((resolve) => window.setTimeout(resolve, ms));
  }

  function normalize(str) {
    return (str || '').trim().toLowerCase();
  }

  /** Renders the clue at the current index into the gate UI. */
  function renderClue() {
    const clue = StoryData.quiz.clues[clueIndex];
    progressEl.textContent = `${clueIndex + 1} / ${StoryData.quiz.clues.length}`;
    questionEl.textContent = clue.question;
    inputEl.value = '';
    feedbackEl.textContent = '';
    feedbackEl.classList.remove('quiz-feedback-wrong', 'quiz-feedback-correct');
    gateEl.classList.remove('quiz-gate-shake');
    inputEl.focus();
  }

  /** Checks the current input against the current clue's answer. */
  async function checkAnswer() {
    if (busy) return;
    const clue = StoryData.quiz.clues[clueIndex];
    const given = normalize(inputEl.value);
    if (!given) return; // don't reward/punish an empty submit

    if (given === normalize(clue.answer)) {
      busy = true;
      feedbackEl.textContent = StoryData.quiz.correctFeedback;
      feedbackEl.classList.remove('quiz-feedback-wrong');
      feedbackEl.classList.add('quiz-feedback-correct');
      await wait(700);
      busy = false;

      clueIndex++;
      if (clueIndex >= StoryData.quiz.clues.length) {
        SceneManager.go('mystery-reveal');
      } else {
        renderClue();
      }
      return;
    }

    feedbackEl.textContent = StoryData.quiz.wrongFeedback;
    feedbackEl.classList.remove('quiz-feedback-correct');
    feedbackEl.classList.add('quiz-feedback-wrong');
    gateEl.classList.remove('quiz-gate-shake');
    void gateEl.offsetWidth; // restart the shake animation on repeat wrong answers
    gateEl.classList.add('quiz-gate-shake');
    inputEl.select();
    inputEl.focus();
  }

  /** Chapter 4.3 — collected clues flash on screen and assemble before handing off to the letter. */
  async function runMysteryReveal() {
    mysteryCluesEl.innerHTML = '';
    StoryData.quiz.clues.forEach((clue) => {
      const chip = document.createElement('div');
      chip.className = 'mystery-clue-chip';
      chip.textContent = clue.answer;
      mysteryCluesEl.appendChild(chip);
    });

    const chips = Array.from(mysteryCluesEl.children);
    for (const chip of chips) {
      chip.classList.add('mystery-clue-chip-visible');
      await wait(260); // stagger each clue into view, mystery-show style
    }

    await wait(300);
    mysteryTextEl.textContent = '';
    await DialogueEngine.typeInto(mysteryTextEl, StoryData.mysteryReveal.assembleText);
    await Input.waitForAdvance();

    Letter.start();
  }

  /** Called by map.js when the player clicks "Summit of Firsts." */
  function start() {
    clueIndex = 0;
    HUD.hide(); // the quiz/letter/finale flow has no chapter progress left to show
    SceneManager.go('quiz');
  }

  function init() {
    mount();
    SceneManager.register('quiz', {
      onEnter() {
        GameAudio.play('quiz');
        inscriptionEl.textContent = StoryData.quiz.inscription;
        renderClue();
      },
    });
    SceneManager.register('mystery-reveal', {
      onEnter() {
        GameAudio.play('mystery-reveal');
        runMysteryReveal();
      },
    });
  }

  return { init, start };
})();
window.Quiz = Quiz;
