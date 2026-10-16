import * as THREE from "three";

const CELL = 64;

function draw(ctx, chars, family) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `600 ${Math.round(CELL * 0.82)}px ${family}`;
  [...chars].forEach((ch, i) => ctx.fillText(ch, i * CELL + CELL / 2, CELL / 2 + 2));
}

/**
 * One-row texture atlas of the given glyphs (white on transparent), used by
 * point shaders to draw each point as a character. Redraws once the web font
 * has loaded so the 3D glyphs match the page typography.
 */
export function makeGlyphAtlas(chars) {
  const canvas = document.createElement("canvas");
  canvas.width = CELL * chars.length;
  canvas.height = CELL;
  const ctx = canvas.getContext("2d");
  draw(ctx, chars, "ui-monospace, Menlo, Consolas, monospace");

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.NoColorSpace;
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;

  const family = `"IBM Plex Mono", ui-monospace, monospace`;
  document.fonts?.load?.(`600 50px ${family}`).then(() => {
    draw(ctx, chars, family);
    texture.needsUpdate = true;
  }).catch(() => {});

  return { texture, count: chars.length };
}
