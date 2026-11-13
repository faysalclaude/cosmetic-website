export type Palette = { accent: string; soft: string; deep: string };

export const defaultPalette: Palette = {
  accent: "#e81c68",
  soft: "#fcf0f4",
  deep: "#4a0a25",
};

type RGB = [number, number, number];

const toHex = ([r, g, b]: RGB) =>
  "#" +
  [r, g, b]
    .map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0"))
    .join("");

const mix = (a: RGB, b: RGB, t: number): RGB => [
  a[0] + (b[0] - a[0]) * t,
  a[1] + (b[1] - a[1]) * t,
  a[2] + (b[2] - a[2]) * t,
];

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not load the image"));
    img.src = src;
  });
}

// Throws when the colours cannot be read (for example a blocked cross-site image).
export async function extractPaletteStrict(imageUrl: string): Promise<Palette> {
  const img = await loadImage(imageUrl);
  const size = 48;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Canvas is not supported");

  ctx.drawImage(img, 0, 0, size, size);
  const { data } = ctx.getImageData(0, 0, size, size);

  let r = 0;
  let g = 0;
  let b = 0;
  let weight = 0;

  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] < 200) continue; // skip transparent pixels
    const max = Math.max(data[i], data[i + 1], data[i + 2]);
    const min = Math.min(data[i], data[i + 1], data[i + 2]);
    const saturation = max === 0 ? 0 : (max - min) / max;
    const w = saturation * saturation + 0.02; // favour saturated colours
    r += data[i] * w;
    g += data[i + 1] * w;
    b += data[i + 2] * w;
    weight += w;
  }

  if (weight === 0) throw new Error("No colour found");

  const accent: RGB = [r / weight, g / weight, b / weight];
  return {
    accent: toHex(accent),
    soft: toHex(mix(accent, [255, 255, 255], 0.88)),
    deep: toHex(mix(accent, [0, 0, 0], 0.7)),
  };
}

// Never throws: falls back to the brand palette.
export async function extractPalette(imageUrl: string): Promise<Palette> {
  try {
    return await extractPaletteStrict(imageUrl);
  } catch {
    return defaultPalette;
  }
}