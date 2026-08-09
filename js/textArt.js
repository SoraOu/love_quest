/* =========================================================
   LOVE QUEST — textArt.js  (Chapter 4.6 add-on)
   Turns a photo into a picture made out of text — loads an
   <img>, downsamples it onto an offscreen <canvas> to a small
   grid of cells, reads each cell's brightness, and picks a
   character for it: dark cells get the next letter from
   `fillText` (cycled through end-to-end, so the finished
   picture is visibly spelled out of her name), light cells
   get a space. Rendered into a <pre> so the monospace grid
   lines up.

   Same "drop the file in and it just works" convention as
   every other asset in this project (see Assets.portraitImg
   / StoryData.assets.portraitImg) — safe to call before the
   photo exists; resolves to an empty string and logs quietly
   so the caller can fall back to something else.
   ========================================================= */

const TextArt = (function () {
  'use strict';

  /**
   * @param {string} src - image path (e.g. Assets.portraitImg())
   * @param {{ cols?: number, fillText?: string, cellAspect?: number, threshold?: number }} [opts]
   *   cols        - how many characters wide the finished art is (default 70)
   *   fillText    - text cycled through to "draw" the dark areas (default "LARA")
   *   cellAspect  - corrects for monospace glyphs being taller than they are
   *                 wide, so the picture isn't squashed vertically (default 0.55)
   *   threshold   - 0-255 brightness cutoff; darker than this gets a
   *                 character, lighter becomes a space (default 165)
   * @returns {Promise<string>} the finished text-art, or "" if the image
   *   isn't available/can't be read yet.
   */
  function renderFromImage(src, opts) {
    opts = opts || {};
    const cols = opts.cols || 70;
    const fillText = (opts.fillText && opts.fillText.trim()) || 'LARA';
    const cellAspect = opts.cellAspect || 0.55;
    const threshold = typeof opts.threshold === 'number' ? opts.threshold : 165;

    return new Promise((resolve) => {
      if (!src) {
        resolve('');
        return;
      }

      const img = new window.Image();
      img.onload = () => {
        try {
          const rows = Math.max(1, Math.round((img.naturalHeight / img.naturalWidth) * cols * cellAspect));
          const canvas = document.createElement('canvas');
          canvas.width = cols;
          canvas.height = rows;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, cols, rows);
          const { data } = ctx.getImageData(0, 0, cols, rows);

          let fillIndex = 0;
          const lines = [];
          for (let y = 0; y < rows; y++) {
            let line = '';
            for (let x = 0; x < cols; x++) {
              const i = (y * cols + x) * 4;
              const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
              // Fully transparent pixels count as "background" (light).
              const luminance = a === 0 ? 255 : (0.299 * r + 0.587 * g + 0.114 * b);
              if (luminance < threshold) {
                line += fillText[fillIndex % fillText.length];
                fillIndex++;
              } else {
                line += ' ';
              }
            }
            lines.push(line);
          }
          resolve(lines.join('\n'));
        } catch (err) {
          // Most common cause: the image was loaded cross-origin without
          // CORS headers, which taints the canvas and blocks getImageData.
          console.info('[TextArt] could not render (possibly a CORS-tainted canvas):', err.message);
          resolve('');
        }
      };
      img.onerror = () => {
        console.info(`[TextArt] no image found at "${src}" yet — drop it in and this'll just work.`);
        resolve('');
      };
      img.src = src;
    });
  }

  return { renderFromImage };
})();

window.TextArt = TextArt;