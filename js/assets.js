/* =========================================================
   LOVE QUEST — assets.js
   Resolves real sprite/image file paths from StoryData.assets
   so every other module can say "give me Mudkip's front sprite"
   without knowing (or caring) about folder layout or file
   extensions. If the folder layout ever changes, this is the
   only file that needs to change.
   ========================================================= */

const Assets = (function () {
  'use strict';

  const cfg = StoryData.assets;

  function pokemonFront(dex, ext) {
    return `${cfg.pokemonFrontDir}/${dex}.${ext || 'gif'}`;
  }

  function pokemonBack(dex, ext) {
    return `${cfg.pokemonBackDir}/${dex}.${ext || 'gif'}`;
  }

  function trainer(name) {
    return `${cfg.trainerDir}/${name}.png`;
  }

  /**
   * Per-location background for the chapter/memory screen (Chapter 3.3).
   * Keyed by locationId (e.g. "lamoria-town") so each of the 4 chapter
   * locations can carry its own art instead of sharing one generic
   * `.chapter-bg` image. Falls back to the `.chapter-bg` placeholder
   * color in CSS until a matching file is dropped in.
   */
  function chapterBg(locationId, ext) {
    return `${cfg.chapterBgDir}/${locationId}.${ext || 'gif'}`;
  }

  function dialogueBox() {
    return cfg.dialogueBoxImg;
  }

  function megaSwampertSheet() {
    
    return cfg.megaSwampertSheet;
  }

  /** Source photo for the Chapter 4.6 text-art easter egg. */
  function portraitImg() {
    return cfg.portraitImg;
  }
  
  /** Front sprite for a given party evolution stage ('mudkip' | 'marshtomp' | 'swampert' | 'mega-swampert'). */
  function partyFront(stage) {
    const info = cfg.partyStageSprites[stage];
    if (!info) return null;
    return info.sheet ? megaSwampertSheet() : pokemonFront(info.dex, info.ext);
  }

  /** Back sprite (used for the player's own Pokémon in battle). Returns null for stages with no back sprite (mega). */
  function partyBack(stage) {
    const info = cfg.partyStageSprites[stage];
    if (!info || info.sheet) return null;
    return pokemonBack(info.dex, info.ext);
  }

  /**
   * Explicit on-screen size for a given evolution stage's sprite in the
   * evolution scene (StoryData.assets.partyStageSprites[stage].size),
   * so mudkip/marshtomp/swampert/mega-swampert can each be sized
   * independently instead of sharing one fixed `.evolution-sprite`
   * size. Returns null if that stage has no size configured, so the
   * caller can fall back to the CSS default via setSize(el, null).
   */
  function partyFrontSize(stage) {
    const info = cfg.partyStageSprites[stage];
    return (info && info.size) ? info.size : null;
  }

  /** Sets (or clears, if url is falsy) an element's background-image. */
  function setBg(el, url) {
    if (!el) return;
    el.style.backgroundImage = url ? `url('${url}')` : 'none';
  }

  /**
   * Sets (or clears, if size/width/height is missing) an element's
   * explicit pixel width/height. Lets per-chapter or per-stage sprite
   * art use independent sizes instead of one shared CSS size — falls
   * back to whatever size the element's CSS class already defines
   * when `size` is null/undefined.
   * @param {HTMLElement} el
   * @param {{ width?: number, height?: number }|null|undefined} size
   */
  function setSize(el, size) {
    if (!el) return;
    el.style.width = (size && size.width) ? `${size.width}px` : '';
    el.style.height = (size && size.height) ? `${size.height}px` : '';
  }

  return {
    pokemonFront, pokemonBack, trainer, chapterBg, dialogueBox, megaSwampertSheet, portraitImg,
    partyFront, partyBack, partyFrontSize, setBg, setSize,
  };
})();
window.Assets = Assets;
