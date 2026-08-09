/* =========================================================
   LOVE QUEST — pixelPhoto.js  (Chapter 4.6 add-on)
   Draws Assets.portraitImg() onto a small offscreen-resolution
   <canvas>, downsampled to `targetWidth` real pixels. The canvas
   is then displayed much bigger via CSS (see .finale-photo in
   style.css), with `image-rendering: pixelated` on that CSS rule
   doing the actual work: browsers scale a low-res bitmap up in
   hard blocks instead of smoothing it, which reads as a pixel-art
   texture rather than a blurry enlargement. `targetWidth` controls
   how coarse that texture is — bigger number, closer to the real
   photo; smaller number, chunkier pixel-art blocks. It's NOT a
   full 8-bit/retro-sprite conversion (that would need color
   quantization/dithering on top of this), just a mild pixelation.

   Same "safe to call before the photo exists" convention as
   js/textArt.js — resolves false and logs quietly so the caller
   can leave the toggle button disabled/hidden instead.
   ========================================================= */

const PixelPhoto = (function () {
  'use strict';

  /**
   * @param {HTMLCanvasElement} canvasEl - canvas to draw into (its
   *   width/height attributes get set to the downsampled resolution;
   *   its on-screen size is controlled entirely by CSS)
   * @param {string} src - image path (e.g. Assets.portraitImg())
   * @param {{ targetWidth?: number }} [opts]
   *   targetWidth - native pixel width of the downsampled grid
   *                 (default 180 — a light pixel-art texture, still
   *                 clearly a photo; try ~80-100 for something chunkier)
   * @returns {Promise<boolean>} true once drawn, false if the image
   *   isn't available/can't be read
   */
  function render(canvasEl, src, opts) {
    opts = opts || {};
    const targetWidth = opts.targetWidth || 180;

    return new Promise((resolve) => {
      if (!src) {
        resolve(false);
        return;
      }

      const img = new window.Image();
      img.onload = () => {
        try {
          const ratio = img.naturalHeight / img.naturalWidth;
          const w = targetWidth;
          const h = Math.max(1, Math.round(targetWidth * ratio));
          canvasEl.width = w;
          canvasEl.height = h;
          const ctx = canvasEl.getContext('2d');
          ctx.imageSmoothingEnabled = true; // smooth on the way DOWN to w×h...
          ctx.clearRect(0, 0, w, h);
          ctx.drawImage(img, 0, 0, w, h);
          resolve(true); // ...pixelated on the way back UP is CSS's job.
        } catch (err) {
          // Most common cause: the image was loaded cross-origin without
          // CORS headers, which taints the canvas.
          console.info('[PixelPhoto] could not render (possibly a CORS-tainted canvas):', err.message);
          resolve(false);
        }
      };
      img.onerror = () => {
        console.info(`[PixelPhoto] no image found at "${src}" yet.`);
        resolve(false);
      };
      img.src = src;
    });
  }

  return { render };
})();

window.PixelPhoto = PixelPhoto;
