export type RemoveMode = "studio" | "ai";

export type RemoveOptions = {
  mode: RemoveMode;
  tolerance?: number; // studio mode only
  onProgress?: (percent: number) => void; // ai mode only
};

export async function removeBackgroundFromFile(
  file: File,
  opts: RemoveOptions,
): Promise<Blob> {
  if (opts.mode === "ai") return removeWithAI(file, opts.onProgress);
  return removeStudioBackground(file, opts.tolerance ?? 38);
}

/* ---------- AI mode (AGPL library, optional) ---------- */
async function removeWithAI(
  file: File,
  onProgress?: (percent: number) => void,
): Promise<Blob> {
  const { removeBackground } = await import("@imgly/background-removal");
  return removeBackground(file, {
    output: { format: "image/png" },
    progress: (_key: string, current: number, total: number) => {
      if (onProgress && total > 0) {
        onProgress(Math.round((current / total) * 100));
      }
    },
  });
}

/* ---------- Studio mode (own code, no AI, no licence) ---------- */
function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read the image"));
    };
    img.src = url;
  });
}

async function removeStudioBackground(
  file: File,
  tolerance: number,
): Promise<Blob> {
  const img = await loadImage(file);

  // Work at a sensible size so it stays fast
  const maxSide = 1400;
  const scale = Math.min(1, maxSide / Math.max(img.naturalWidth, img.naturalHeight));
  const w = Math.max(1, Math.round(img.naturalWidth * scale));
  const h = Math.max(1, Math.round(img.naturalHeight * scale));

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Canvas is not supported");
  ctx.drawImage(img, 0, 0, w, h);

  const imageData = ctx.getImageData(0, 0, w, h);
  const d = imageData.data;

  // 1) Background colour = average of the four corner patches
  const patch = Math.max(2, Math.round(Math.min(w, h) * 0.02));
  const corners: Array<[number, number]> = [
    [0, 0],
    [w - patch, 0],
    [0, h - patch],
    [w - patch, h - patch],
  ];
  let r = 0;
  let g = 0;
  let b = 0;
  let n = 0;
  for (const [cx, cy] of corners) {
    for (let y = cy; y < cy + patch; y++) {
      for (let x = cx; x < cx + patch; x++) {
        const i = (y * w + x) * 4;
        r += d[i];
        g += d[i + 1];
        b += d[i + 2];
        n++;
      }
    }
  }
  r /= n;
  g /= n;
  b /= n;

  const dist = (i: number) => {
    const dr = d[i] - r;
    const dg = d[i + 1] - g;
    const db = d[i + 2] - b;
    return Math.sqrt(dr * dr + dg * dg + db * db);
  };

  // 2) Flood fill from the border through pixels close to the background colour
  const bg = new Uint8Array(w * h);
  const stack = new Int32Array(w * h);
  let sp = 0;

  const tryPush = (x: number, y: number) => {
    const p = y * w + x;
    if (bg[p]) return;
    if (dist(p * 4) <= tolerance) {
      bg[p] = 1;
      stack[sp++] = p;
    }
  };

  for (let x = 0; x < w; x++) {
    tryPush(x, 0);
    tryPush(x, h - 1);
  }
  for (let y = 0; y < h; y++) {
    tryPush(0, y);
    tryPush(w - 1, y);
  }
  while (sp > 0) {
    const p = stack[--sp];
    const x = p % w;
    const y = (p - x) / w;
    if (x > 0) tryPush(x - 1, y);
    if (x < w - 1) tryPush(x + 1, y);
    if (y > 0) tryPush(x, y - 1);
    if (y < h - 1) tryPush(x, y + 1);
  }

  // 3) Make background transparent, soften the edge, find the bounding box
  let minX = w;
  let minY = h;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const p = y * w + x;
      const i = p * 4;

      if (bg[p]) {
        const touchesProduct =
          (x > 0 && !bg[p - 1]) ||
          (x < w - 1 && !bg[p + 1]) ||
          (y > 0 && !bg[p - w]) ||
          (y < h - 1 && !bg[p + w]);

        if (touchesProduct) {
          const ratio = Math.min(1, dist(i) / tolerance);
          d[i + 3] = Math.round(ratio * ratio * 255);
        } else {
          d[i + 3] = 0;
        }
      }

      if (d[i + 3] > 20) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  if (maxX < 0) {
    throw new Error("Nothing was left after removing the background. Lower the tolerance.");
  }

  ctx.putImageData(imageData, 0, 0);

  // 4) Crop to the product with a little padding
  const pad = Math.round(Math.max(w, h) * 0.03);
  const sx = Math.max(0, minX - pad);
  const sy = Math.max(0, minY - pad);
  const ex = Math.min(w, maxX + pad + 1);
  const ey = Math.min(h, maxY + pad + 1);

  const out = document.createElement("canvas");
  out.width = ex - sx;
  out.height = ey - sy;
  const outCtx = out.getContext("2d");
  if (!outCtx) throw new Error("Canvas is not supported");
  outCtx.drawImage(canvas, sx, sy, out.width, out.height, 0, 0, out.width, out.height);

  return new Promise<Blob>((resolve, reject) => {
    out.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Export failed"))),
      "image/png",
    );
  });
}