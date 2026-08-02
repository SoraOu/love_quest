/* =========================================================
   LOVE QUEST — battle.js  (Chapter 3.4)
   FIGHT/ITEM/POKÉMON/RUN menu, HP bars with color states,
   damage pop-ups. This is a love letter, not a punishing
   RPG — the player can't actually lose; a "defeat" just
   shrugs it off and continues, same tone as the rest of it.
   ========================================================= */

const Battle = (function () {
  'use strict';

  let enemyNameEl, enemyLevelEl, enemyHpFillEl, enemySpriteEl;
  let playerNameEl, playerLevelEl, playerHpFillEl, playerSpriteEl;
  let menuEl, submenuEl, logEl;

  let enemyHp, enemyMaxHp, playerHp, playerMaxHp;
  let enemyData, chapterData;
  let busy = false;

  function mount() {
    enemyNameEl = document.querySelector('#battle .battle-panel-enemy .battle-name');
    enemyLevelEl = document.querySelector('#battle .battle-panel-enemy .battle-level');
    enemyHpFillEl = document.querySelector('#battle .battle-panel-enemy .hp-fill');
    enemySpriteEl = document.querySelector('#battle .battle-sprite-enemy');

    playerNameEl = document.querySelector('#battle .battle-panel-player .battle-name');
    playerLevelEl = document.querySelector('#battle .battle-panel-player .battle-level');
    playerHpFillEl = document.querySelector('#battle .battle-panel-player .hp-fill');
    playerSpriteEl = document.querySelector('#battle .battle-sprite-player');

    menuEl = document.querySelector('#battle .battle-menu');
    submenuEl = document.querySelector('#battle .battle-submenu');
    logEl = document.querySelector('#battle .battle-log');

    menuEl.querySelectorAll('.battle-menu-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        onMenuClick(btn.dataset.action);
      });
    });
  }

  function wait(ms) {
    return new Promise((resolve) => window.setTimeout(resolve, ms));
  }

  /** @param {HTMLElement} fillEl @param {number} hp @param {number} maxHp */
  function setHpBar(fillEl, hp, maxHp) {
    const pct = Math.max(0, Math.round((hp / maxHp) * 100));
    fillEl.style.transform = `scaleX(${pct / 100})`;
    fillEl.classList.remove('hp-high', 'hp-mid', 'hp-low');
    fillEl.classList.add(pct > 50 ? 'hp-high' : pct > 20 ? 'hp-mid' : 'hp-low');
  }

  function log(text) {
    logEl.textContent = text;
  }

  function showDamagePop(targetSpriteEl, amount) {
    const pop = document.createElement('div');
    pop.className = 'damage-pop';
    pop.textContent = `-${amount}`;
    targetSpriteEl.appendChild(pop);
    window.setTimeout(() => pop.remove(), 700);
  }

  /** Called by Chapter once the memory beat finishes. */
  function startFor(chapter) {
    chapterData = chapter;
    const enemies = StoryData.battle.enemies;
    enemyData = enemies.length
      ? enemies[(chapter.id - 1) % enemies.length]
      : { id: 'enemy', name: '', introLine: '' };
    SceneManager.go('battle');
  }

  function resetBattleState() {
    enemyMaxHp = 30 + chapterData.id * 5;
    enemyHp = enemyMaxHp;
    playerMaxHp = 40 + GameState.state.partyLevel * 2;
    playerHp = playerMaxHp;
    busy = false;
  }

  function renderPanels() {
    enemyNameEl.textContent = enemyData.name;
    enemyLevelEl.textContent = `Lv.${chapterData.id * 3 + 2}`;
    setHpBar(enemyHpFillEl, enemyHp, enemyMaxHp);
    enemySpriteEl.className = 'sprite battle-sprite-enemy';
    Assets.setBg(enemySpriteEl, Assets.pokemonFront(enemyData.dex, enemyData.ext));

    playerNameEl.textContent = GameState.partyLabel();
    playerLevelEl.textContent = `Lv.${GameState.state.partyLevel}`;
    setHpBar(playerHpFillEl, playerHp, playerMaxHp);
    playerSpriteEl.className = 'sprite battle-sprite-player';
    // Battle convention: the player's own Pokémon shows its BACK sprite.
    Assets.setBg(playerSpriteEl, Assets.partyBack(GameState.state.partyStage));
  }

  function showMainMenu() {
    submenuEl.classList.add('hidden');
    submenuEl.innerHTML = '';
    menuEl.classList.remove('hidden');
  }

  async function playerAttack() {
    if (busy) return;
    busy = true;
    menuEl.classList.add('hidden');

    const dmg = 6 + Math.floor(Math.random() * 5);
    enemyHp = Math.max(0, enemyHp - dmg);
    enemySpriteEl.classList.add('sprite-hit');
    showDamagePop(enemySpriteEl, dmg);
    setHpBar(enemyHpFillEl, enemyHp, enemyMaxHp);
    log(`${GameState.partyLabel()} attacks!`);
    await wait(500);
    enemySpriteEl.classList.remove('sprite-hit');

    if (enemyHp <= 0) {
      await onVictory();
      return;
    }

    const edmg = 4 + Math.floor(Math.random() * 4);
    playerHp = Math.max(0, playerHp - edmg);
    playerSpriteEl.classList.add('sprite-hit');
    showDamagePop(playerSpriteEl, edmg);
    setHpBar(playerHpFillEl, playerHp, playerMaxHp);
    log(`${enemyData.name} strikes back!`);
    await wait(500);
    playerSpriteEl.classList.remove('sprite-hit');

    if (playerHp <= 0) {
      playerHp = playerMaxHp; // no real losing condition — see file header
      setHpBar(playerHpFillEl, playerHp, playerMaxHp);
      log(`${GameState.partyLabel()} shakes it off and keeps going.`);
      await wait(500);
    }

    busy = false;
    showMainMenu();
  }

  async function onVictory() {
    log(StoryData.battle.victoryLine || `${enemyData.name} was defeated!`);
    await wait(900);

    const evolvesThisChapter = chapterData.id === 2 || chapterData.id === 4;
    if (evolvesThisChapter) {
      Evolution.startFor(chapterData.id, () => Chapter.onBattleWon());
    } else {
      Chapter.onBattleWon();
    }
  }

  function showItemSubmenu() {
    submenuEl.innerHTML = '';
    submenuEl.classList.remove('hidden');
    menuEl.classList.add('hidden');

    const items = StoryData.chapters
      .map((c, i) => ({ name: c.itemName, unlocked: GameState.state.itemsUnlocked[i] }))
      .filter((it) => it.unlocked && it.name);

    if (!items.length) {
      const empty = document.createElement('div');
      empty.className = 'battle-submenu-empty';
      empty.textContent = 'Nothing to use yet.';
      submenuEl.appendChild(empty);
    } else {
      items.forEach((it) => {
        const row = document.createElement('div');
        row.className = 'battle-submenu-row';
        row.textContent = it.name;
        submenuEl.appendChild(row);
      });
    }

    const backBtn = document.createElement('button');
    backBtn.type = 'button';
    backBtn.className = 'battle-submenu-back';
    backBtn.textContent = 'BACK';
    backBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      showMainMenu();
    });
    submenuEl.appendChild(backBtn);
  }

  function onMenuClick(action) {
    if (busy) return;
    if (action === 'fight') {
      playerAttack();
      return;
    }
    if (action === 'item') {
      showItemSubmenu();
      return;
    }
    if (action === 'run') {
      log("Can't run from a memory.");
      return;
    }
    log('Not available yet.'); // 'pokemon' submenu — nothing to swap to in a one-party story
  }

  function init() {
    mount();
    SceneManager.register('battle', {
      onEnter() {
        GameAudio.play('battle');
        resetBattleState();
        renderPanels();
        log(enemyData.introLine || `${enemyData.name} wants to battle!`);
        showMainMenu();
      },
    });
  }

  return { init, startFor };
})();
window.Battle = Battle;
