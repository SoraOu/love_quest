/* =========================================================
   LOVE QUEST — audio.js  (Chapter 2.6)
   Skeleton only — no real tracks exist yet (5.1/5.2 source
   them, 5.3 wires up Howler.js). Every scene can already
   call GameAudio.play('sceneName') today; it just no-ops
   quietly until a track is registered for that id.

   Named `GameAudio` (not `Audio`) so it doesn't shadow the
   browser's built-in window.Audio constructor, which this
   file uses internally.

   Mute state is in-memory only for the whole session — no
   localStorage, per project rules (see 5.3).
   ========================================================= */

const GameAudio = (function () {
  'use strict';

  /** @type {Record<string, { src: string, loop: boolean, volume: number }>} */
  const tracks = {};
  let currentTrackId = null;
  let currentEl = null;
  let muted = false;

  /**
   * Registers a track for a scene id. Call this once per scene,
   * whenever real audio files exist (5.2) — safe to call before then too.
   * @param {string} sceneId
   * @param {string} src
   * @param {{ loop?: boolean, volume?: number }} [opts]
   */
  function registerTrack(sceneId, src, opts) {
    opts = opts || {};
    tracks[sceneId] = {
      src,
      loop: opts.loop !== false,
      volume: typeof opts.volume === 'number' ? opts.volume : 0.6,
    };
  }

  /**
   * Switches the currently playing track to whatever is registered
   * for `sceneId`. Silently does nothing if no track is registered
   * yet — scenes are free to call this before assets exist.
   *
   * If the incoming scene shares the exact same audio file as
   * whatever's already playing (e.g. several scenes all use one
   * "overall" background track), playback is left alone instead of
   * restarting from 0:00 — so one track can span many scenes
   * seamlessly instead of stuttering on every transition.
   * @param {string} sceneId
   */
  function play(sceneId) {
    const track = tracks[sceneId];

    if (track && currentEl && tracks[currentTrackId] && tracks[currentTrackId].src === track.src) {
      currentTrackId = sceneId;
      return;
    }

    stop();
    currentTrackId = sceneId;

    if (!track) {
      console.info(`[GameAudio] no track registered for "${sceneId}" yet — playing silently.`);
      return;
    }

    const el = new window.Audio(track.src);
    el.loop = track.loop;
    el.volume = muted ? 0 : track.volume;
    el.play().catch((err) => {
      // Common causes at this stage: file doesn't exist yet, or the
      // browser blocked autoplay before the first user gesture.
      console.info(`[GameAudio] couldn't play "${sceneId}":`, err.message);
    });
    currentEl = el;
  }

  function stop() {
    if (currentEl) {
      currentEl.pause();
      currentEl = null;
    }
    currentTrackId = null;
  }

  function toggleMute() {
    setMute(!muted);
    return muted;
  }

  /** @param {boolean} value */
  function setMute(value) {
    muted = value;
    if (currentEl && currentTrackId && tracks[currentTrackId]) {
      currentEl.volume = muted ? 0 : tracks[currentTrackId].volume;
    }
  }

  function isMuted() {
    return muted;
  }

  return { registerTrack, play, stop, toggleMute, setMute, isMuted };
})();

window.GameAudio = GameAudio;
