/* =========================================================
   LOVE QUEST — map.js
   Three closely related things live here, same reasoning as
   boot.js bundling boot/name-reveal/intro: none of these has
   enough surface area to justify its own file, and they all
   read/write the same progress state.

   1. GameState — the single source of truth for how far the
      player has gotten (unlocked locations, party evolution
      stage, level/XP, which of the 5 items are collected, and
      the nickname the player gave their Mudkip partner).
   2. HUD — the persistent party/item panel shown during
      map, chapter, and battle scenes.
   3. Map — the world map screen itself (Chapter 3.1).
   ========================================================= */

const GameState = (function () {
  'use strict';

  const STAGE_ORDER = ['mudkip', 'marshtomp', 'swampert', 'mega-swampert'];
  const STAGE_LABEL = {
    mudkip: 'MUDKIP',
    marshtomp: 'MARSHTOMP',
    swampert: 'SWAMPERT',
    'mega-swampert': 'MEGA SWAMPERT',
  };

  const state = {
    unlockedLocationIds: ['lamoria-town'],
    completedChapterIds: [],
    partyStage: 'mudkip',
    partyLevel: 5,
    partyXp: 0,
    partyXpToNext: 100,
    // 5 slots total: one per chapter (4) + one tied to the Ch.4 letter/reveal sequence
    itemsUnlocked: [false, false, false, false, false],
    // Set once via Boot's nickname prompt, right after the intro
    // dialogue. In-memory only for the session — no localStorage,
    // per project rules.
    mudkipNickname: '',
  };

  function isUnlocked(locationId) {
    return state.unlockedLocationIds.includes(locationId);
  }

  function unlockLocation(locationId) {
    if (!isUnlocked(locationId)) state.unlockedLocationIds.push(locationId);
  }

  /**
   * Marks a chapter finished, grants XP, and flips on the item
   * slot for it (if given).
   * @param {number} chapterId
   * @param {number} [itemSlotIndex]
   */
  function completeChapter(chapterId, itemSlotIndex) {
    if (!state.completedChapterIds.includes(chapterId)) {
      state.completedChapterIds.push(chapterId);
    }
    if (typeof itemSlotIndex === 'number' && itemSlotIndex >= 0) {
      state.itemsUnlocked[itemSlotIndex] = true;
    }
    state.partyXp += 20;
    while (state.partyXp >= state.partyXpToNext) {
      state.partyXp -= state.partyXpToNext;
      state.partyLevel += 1;
    }
  }

  /** Advances the party to the next evolution stage, if any remain. */
  function evolve() {
    const idx = STAGE_ORDER.indexOf(state.partyStage);
    if (idx < STAGE_ORDER.length - 1) {
      state.partyStage = STAGE_ORDER[idx + 1];
      return true;
    }
    return false;
  }

  /**
   * Stores the nickname the player gave their Mudkip partner
   * (Boot's post-intro nickname prompt). Called once; safe to call
   * again if that ever changes. Blank/whitespace-only input is
   * treated as "no nickname" so partyLabel() falls back to the
   * species label instead of showing an empty name everywhere.
   * @param {string} name
   */
  function setNickname(name) {
    state.mudkipNickname = (name || '').trim();
  }

  /** The display name used in the HUD, battle panels, and evolution
   * text — the player's chosen nickname once set, otherwise the
   * current evolution stage's species label (e.g. "MUDKIP"). */
  function partyLabel() {
    return state.mudkipNickname || STAGE_LABEL[state.partyStage];
  }

  /**
   * Resolves the `{mudkipName}` token in any piece of written text
   * (dialogue lines, memory text, item name/desc, letter body, etc.)
   * to the current partyLabel(). Non-string input passes through
   * unchanged so callers can use it defensively without extra checks.
   * @param {string} text
   * @returns {string}
   */
  function applyTemplate(text) {
    if (typeof text !== 'string') return text;
    return text.replace(/\{mudkipName\}/g, partyLabel());
  }

  return {
    state,
    isUnlocked,
    unlockLocation,
    completeChapter,
    evolve,
    setNickname,
    partyLabel,
    applyTemplate,
    STAGE_ORDER,
  };
})();
window.GameState = GameState;

const HUD = (function () {
  'use strict';

  let el, nameEl, levelEl, xpFillEl, slotEls;

  function mount() {
    el = document.querySelector('.hud');
    if (!el) return;
    nameEl = el.querySelector('.hud-party-name');
    levelEl = el.querySelector('.hud-party-level');
    xpFillEl = el.querySelector('.hud-xp-fill');
    slotEls = Array.from(el.querySelectorAll('.hud-item-slot'));
  }

  function show() {
    if (el) el.classList.remove('hidden');
  }

  function hide() {
    if (el) el.classList.add('hidden');
  }

  function update() {
    if (!el) return;
    nameEl.textContent = GameState.partyLabel();
    levelEl.textContent = `Lv.${GameState.state.partyLevel}`;
    const pct = Math.round((GameState.state.partyXp / GameState.state.partyXpToNext) * 100);
    xpFillEl.style.transform = `scaleX(${pct / 100})`;
    slotEls.forEach((slot, i) => {
      slot.classList.toggle('unlocked', !!GameState.state.itemsUnlocked[i]);
    });
  }

  return { mount, show, hide, update };
})();
window.HUD = HUD;

const Map = (function () {
  'use strict';

  let locationsEl;

  function mount() {
    locationsEl = document.querySelector('#map .map-locations');
  }

  function render() {
    locationsEl.innerHTML = '';
    StoryData.map.locations.forEach((loc) => {
      const unlocked = GameState.isUnlocked(loc.id);
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'map-location';
      btn.classList.toggle('locked', !unlocked);
      btn.disabled = !unlocked;
      btn.textContent = unlocked ? loc.name : '???';
      btn.addEventListener('click', (e) => {
        e.stopPropagation(); // handled directly, not via the global advance-click
        if (!unlocked) return;
        // "Summit of Firsts" is the one location with no chapter/battle of
        // its own — see the README design note. It's the entry point into
        // Chapter 4's quiz/letter/finale flow instead.
        if (loc.id === 'summit-of-firsts') {
          Quiz.start();
        } else {
          Chapter.travelTo(loc.id);
        }
      });
      locationsEl.appendChild(btn);
    });
  }

  function init() {
    mount();
    SceneManager.register('map', {
      onEnter() {
        GameAudio.play('map');
        HUD.show();
        HUD.update();
        render();
      },
    });
  }

  return { init, render };
})();
window.Map = Map;
