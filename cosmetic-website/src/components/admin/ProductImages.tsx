"use client";

import { useRef, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { removeBackgroundFromFile } from "@/lib/bg-removal";
import { extractPaletteStrict } from "@/lib/palette";
import { uploadProductMedia } from "@/lib/upload";
import {
  deleteImageAction,
  registerImageAction,
  reorderImagesAction,
  updateProductColorsAction,
} from "@/lib/actions/product-media";
import type { ProductImageInfo } from "@/types/admin";

const MAX_IMAGES = 8;

type Msg = { tone: "ok" | "error"; text: string } | null;

export default function ProductImages({
  productId,
  images,
}: {
  productId: string;
  images: ProductImageInfo[];
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [removeBg, setRemoveBg] = useState(true);
  const [message, setMessage] = useState<Msg>(null);

  async function run(task: () => Promise<string | void>) {
    setBusy(true);
    setMessage(null);
    try {
      const text = await task();
      if (text) setMessage({ tone: "ok", text });
    } catch (err) {
      setMessage({
        tone: "error",
        text: err instanceof Error ? err.message : "Something went wrong.",
      });
    } finally {
      setBusy(false);
      router.refresh();
    }
  }

  function onFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (files.length === 0) return;

    void run(async () => {
      if (images.length + files.length > MAX_IMAGES) {
        throw new Error(`A product can have at most ${MAX_IMAGES} images.`);
      }

      let colourNote = "";

      for (const [index, file] of files.entries()) {
        if (!file.type.startsWith("image/")) throw new Error(`${file.name} is not an image.`);

        let source: Blob = file;
        if (removeBg) {
          try {
            source = await removeBackgroundFromFile(file, { mode: "studio", tolerance: 38 });
          } catch {
            source = file; // keep the original if the plain background could not be removed
          }
        }

        const { path, blob } = await uploadProductMedia(productId, "image", source, {
          maxSide: 1600,
          quality: 0.88,
        });

        const registered = await registerImageAction(productId, path);
        if (!registered.ok) throw new Error(registered.error);

        // First image of a product: match the product colours to the photo automatically.
        if (images.length === 0 && index === 0) {
          const url = URL.createObjectURL(blob);
          try {
            const palette = await extractPaletteStrict(url);
            const colours = await updateProductColorsAction(productId, palette.soft, palette.accent);
            if (colours.ok) colourNote = " Product colours were matched to the photo.";
          } catch {
            // colours can still be matched later with the button
          } finally {
            URL.revokeObjectURL(url);
          }
        }
      }

      return (files.length === 1 ? "Image uploaded." : `${files.length} images uploaded.`) + colourNote;
    });
  }

  function reorder(from: number, to: number) {
    if (to < 0 || to >= images.length) return;
    const ids = images.map((i) => i.id);
    const [moved] = ids.splice(from, 1);
    ids.splice(to, 0, moved);
    void run(async () => {
      const result = await reorderImagesAction(productId, ids);
      if (!result.ok) throw new Error(result.error);
    });
  }

  function remove(id: string) {
    if (!window.confirm("Delete this image?")) return;
    void run(async () => {
      const result = await deleteImageAction(id);
      if (!result.ok) throw new Error(result.error);
      return "Image deleted.";
    });
  }

  function matchColours() {
    const main = images[0];
    if (!main) return;
    void run(async () => {
      let palette;
      try {
        palette = await extractPaletteStrict(main.url);
      } catch {
        throw new Error(
          "Could not read the colours of this image. Set the colours by hand under Details.",
        );
      }
      const result = await updateProductColorsAction(productId, palette.soft, palette.accent);
      if (!result.ok) throw new Error(result.error);
      return "Colours matched to the main image.";
    });
  }

  const small =
    "rounded-lg border border-line px-2 py-1 text-xs font-medium hover:border-brand hover:text-brand disabled:opacity-40";

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        multiple
        onChange={onFiles}
        className="hidden"
      />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {images.map((image, index) => (
          <div key={image.id} className="rounded-2xl border border-line p-2">
            <div className="relative aspect-square overflow-hidden rounded-xl bg-cream">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image.url} alt="" className="h-full w-full object-contain p-2" />
              {index === 0 && (
                <span className="absolute top-2 left-2 rounded-full bg-brand px-2.5 py-1 text-[10px] font-bold text-white">
                  MAIN
                </span>
              )}
            </div>
            <div className="mt-2 flex flex-wrap gap-1">
              <button type="button" disabled={busy || index === 0} onClick={() => reorder(index, index - 1)} className={small}>
                ←
              </button>
              <button type="button" disabled={busy || index === images.length - 1} onClick={() => reorder(index, index + 1)} className={small}>
                →
              </button>
              {index !== 0 && (
                <button type="button" disabled={busy} onClick={() => reorder(index, 0)} className={small}>
                  Make main
                </button>
              )}
              <button type="button" disabled={busy} onClick={() => remove(image.id)} className={`${small} text-brand-dark`}>
                Delete
              </button>
            </div>
          </div>
        ))}

        {images.length < MAX_IMAGES && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className="flex aspect-square flex-col items-center justify-center rounded-2xl border-2 border-dashed border-line bg-cream text-sm font-medium text-muted hover:border-brand hover:text-brand disabled:opacity-60"
          >
            {busy ? "Working..." : "+ Add images"}
            <span className="mt-1 text-xs font-normal">{images.length}/{MAX_IMAGES}</span>
          </button>
        )}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={removeBg}
            onChange={(e) => setRemoveBg(e.target.checked)}
            className="h-4 w-4 accent-[var(--color-brand)]"
          />
          Remove the plain background automatically
        </label>
        {images.length > 0 && (
          <button
            type="button"
            onClick={matchColours}
            disabled={busy}
            className="rounded-full border border-ink px-5 py-2 text-sm font-medium hover:bg-ink hover:text-white disabled:opacity-50"
          >
            Match colours to the main image
          </button>
        )}
      </div>

      <p className="mt-3 text-xs text-muted">
        Best results: the product alone on a plain light background, square or portrait,
        at least 1000 px. If a white product loses parts of itself, untick the box and
        upload again. The first image is the main image shown on cards and in the slider.
      </p>

      {message && (
        <p
          role={message.tone === "error" ? "alert" : "status"}
          className={`mt-4 rounded-xl px-4 py-3 text-sm font-medium ${
            message.tone === "error" ? "bg-brand-soft text-brand-dark" : "bg-green-100 text-green-800"
          }`}
        >
          {message.text}
        </p>
      )}
    </div>
  );
}