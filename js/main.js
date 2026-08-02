/* =========================================================
   LOVE QUEST — main.js
   WIRING ONLY. No game logic lives here — it boots the core
   engines in dependency order, hands off to each scene
   module's own init(), and kicks off the very first scene.
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  Input.init();
  SceneManager.init('#game-root');
  DialogueEngine.mount();
  HUD.mount();

  Boot.init();      // registers 'boot', 'name-reveal', 'intro'
  Map.init();        // registers 'map'
  Chapter.init();     // registers 'chapter'
  Battle.init();      // registers 'battle'
  Evolution.init();   // registers 'evolution'
  Quiz.init();         // registers 'quiz', 'mystery-reveal'
  Letter.init();        // registers 'letter', 'finale'

  // --- Music ---------------------------------------------------------
  // 3 tracks total. Drop the actual files into assets/music/ with these
  // exact names and they'll just start working — no other code changes.
  // "Overall" is registered under every scene except battle/letter so it
  // plays continuously (without restarting) as you move between them.
  GameAudio.registerTrack('battle', 'assets/music/battle.mp3');
  GameAudio.registerTrack('letter', 'assets/music/letter.mp3');
  ['boot', 'name-reveal', 'intro', 'map', 'chapter', 'evolution', 'quiz', 'mystery-reveal', 'finale']
    .forEach((sceneId) => GameAudio.registerTrack(sceneId, 'assets/music/overall.mp3'));

  SceneManager.go('boot');
});
