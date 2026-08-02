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

  /** Sets (or clears, if url is falsy) an element's background-image. */
  function setBg(el, url) {
    if (!el) return;
    el.style.backgroundImage = url ? `url('${url}')` : 'none';
  }

  return { pokemonFront, pokemonBack, trainer, chapterBg, dialogueBox, megaSwampertSheet, partyFront, partyBack, setBg };
})();
window.Assets = Assets;
