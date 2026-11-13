"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { removeBackgroundFromFile, type RemoveMode } from "@/lib/bg-removal";
import { extractPaletteStrict, type Palette } from "@/lib/palette";
import { uploadProductMedia } from "@/lib/upload";
import {
  deleteShowcaseAction,
  saveShowcaseAction,
  setShowcaseApprovedAction,
} from "@/lib/actions/product-media";
import PreviewShowcase from "@/components/showcase/PreviewShowcase";
import { defaultChapters } from "@/components/showcase/copy";
import type { ShowcaseInfo } from "@/types/admin";

type Props = {
  productId: string;
  nameKo: string;
  nameEn: string;
  productTint: string;
  productAccent: string;
  existing: ShowcaseInfo | null;
};

type Status = "idle" | "processing" | "ready";
type Msg = { tone: "ok" | "error"; text: string } | null;

const checker: React.CSSProperties = {
  backgroundImage:
    "linear-gradient(45deg,#e5e5e5 25%,transparent 25%),linear-gradient(-45deg,#e5e5e5 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#e5e5e5 75%),linear-gradient(-45deg,transparent 75%,#e5e5e5 75%)",
  backgroundSize: "16px 16px",
  backgroundPosition: "0 0,0 8px,8px -8px,-8px 0",
};

const btnPrimary =
  "w-full rounded-full bg-brand py-3 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-40";
const btnOutline =
  "w-full rounded-full border border-ink py-3 text-sm font-semibold hover:bg-ink hover:text-white disabled:opacity-40";

export default function ProductStudio({
  productId,
  nameKo,
  nameEn,
  productTint,
  productAccent,
  existing,
}: Props) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const runId = useRef(0);

  const existingPalette: Palette | null = existing
    ? { accent: existing.accent, soft: existing.soft, deep: existing.deep }
    : null;

  const [file, setFile] = useState<File | null>(null);
  const [mode, setMode] = useState<RemoveMode>("studio");
  const [tolerance, setTolerance] = useState(38);
  const [status, setStatus] = useState<Status>("idle");
  const [percent, setPercent] = useState(0);
  const [cutoutBlob, setCutoutBlob] = useState<Blob>();
  const [cutoutUrl, setCutoutUrl] = useState<string>();
  const [palette, setPalette] = useState<Palette>(
    existingPalette ?? { accent: productAccent, soft: productTint, deep: "#4a0a25" },
  );
  const [lang, setLang] = useState<"ko" | "en">("ko");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<Msg>(null);

  const effectiveTolerance = mode === "studio" ? tolerance : 0;

  useEffect(() => {
    if (!file) return;
    const id = ++runId.current;

    const timer = setTimeout(
      async () => {
        setStatus("processing");
        setPercent(0);
        setMessage(null);
        try {
          const blob = await removeBackgroundFromFile(file, {
            mode,
            tolerance: effectiveTolerance,
            onProgress: setPercent,
          });
          if (id !== runId.current) return;

          const url = URL.createObjectURL(blob);
          let colours: Palette | null = null;
          try {
            colours = await extractPaletteStrict(url);
          } catch {
            colours = null;
          }
          if (id !== runId.current) {
            URL.revokeObjectURL(url);
            return;
          }

          setCutoutBlob(blob);
          setCutoutUrl(url);
          if (colours) setPalette(colours);
          setStatus("ready");
          setMessage({
            tone: "ok",
            text: "Cutout ready. Check the edges and colours in the preview, then save.",
          });
        } catch (err) {
          if (id !== runId.current) return;
          setStatus("idle");
          setMessage({
            tone: "error",
            text: err instanceof Error ? err.message : "Background removal failed.",
          });
        }
      },
      mode === "studio" ? 250 : 0,
    );

    return () => clearTimeout(timer);
  }, [file, mode, effectiveTolerance]);

  useEffect(() => {
    return () => {
      if (cutoutUrl) URL.revokeObjectURL(cutoutUrl);
    };
  }, [cutoutUrl]);

  async function save(approve: boolean) {
    if (!cutoutBlob) return;
    setBusy(true);
    setMessage(null);
    try {
      const { path } = await uploadProductMedia(productId, "showcase", cutoutBlob, {
        maxSide: 1400,
        quality: 0.92,
      });
      const result = await saveShowcaseAction(productId, path, palette, approve);
      if (!result.ok) throw new Error(result.error);

      setFile(null);
      setCutoutBlob(undefined);
      setCutoutUrl(undefined);
      setStatus("idle");
      setMessage({
        tone: "ok",
        text: approve
          ? "Approved. The animation is now live on the product page and the Home page."
          : "Saved as a draft. Customers cannot see it yet.",
      });
      router.refresh();
    } catch (err) {
      setMessage({
        tone: "error",
        text: err instanceof Error ? err.message : "Could not save.",
      });
    } finally {
      setBusy(false);
    }
  }

  async function togglePublished() {
    if (!existing) return;
    setBusy(true);
    const result = await setShowcaseApprovedAction(productId, !existing.isApproved);
    setBusy(false);
    if (!result.ok) setMessage({ tone: "error", text: result.error });
    router.refresh();
  }

  async function removeShowcase() {
    if (!window.confirm("Remove this animation?")) return;
    setBusy(true);
    const result = await deleteShowcaseAction(productId);
    setBusy(false);
    if (!result.ok) setMessage({ tone: "error", text: result.error });
    router.refresh();
  }

  const showingNew = Boolean(cutoutUrl);
  const previewUrl = cutoutUrl ?? existing?.imageUrl;
  const previewPalette = showingNew ? palette : (existingPalette ?? palette);
  const previewName = lang === "ko" ? nameKo : nameEn;

  const paletteFields: Array<[keyof Palette, string]> = [
    ["soft", "Background"],
    ["accent", "Accent"],
    ["deep", "Text"],
  ];

  return (
    <div className="grid gap-8 lg:grid-cols-[340px_1fr]">
      <div className="space-y-5">
        {existing && (
          <div className="rounded-2xl border border-line p-4">
            <div className="flex items-center gap-3">
              <div className="h-16 w-16 shrink-0 rounded-xl" style={{ background: existing.soft }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={existing.imageUrl} alt="" className="h-full w-full object-contain p-1" />
              </div>
              <div>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                    existing.isApproved ? "bg-green-100 text-green-800" : "bg-cream text-muted"
                  }`}
                >
                  {existing.isApproved ? "Approved (live)" : "Draft (hidden)"}
                </span>
                <p className="mt-1 text-xs text-muted">Current animation</p>
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={togglePublished}
                disabled={busy}
                className="flex-1 rounded-full border border-ink py-2 text-xs font-semibold hover:bg-ink hover:text-white disabled:opacity-40"
              >
                {existing.isApproved ? "Unpublish" : "Approve and publish"}
              </button>
              <button
                type="button"
                onClick={removeShowcase}
                disabled={busy}
                className="rounded-full border border-line px-4 py-2 text-xs font-semibold text-brand-dark hover:border-brand disabled:opacity-40"
              >
                Remove
              </button>
            </div>
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={status === "processing" || busy}
          className="w-full rounded-2xl border-2 border-dashed border-line bg-cream py-8 text-sm font-medium hover:border-brand disabled:opacity-60"
        >
          {status === "processing"
            ? mode === "ai"
              ? `Removing background... ${percent}%`
              : "Removing background..."
            : file
              ? `Selected: ${file.name} (click to change)`
              : existing
                ? "Upload a new photo to replace it"
                : "Upload a product photo"}
        </button>

        <div className="grid grid-cols-2 gap-2 rounded-full bg-cream p-1 text-sm font-medium">
          {(["studio", "ai"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`rounded-full py-2 ${mode === m ? "bg-brand text-white" : "text-muted"}`}
            >
              {m === "studio" ? "Plain background" : "AI (any background)"}
            </button>
          ))}
        </div>

        {mode === "studio" && (
          <label className="block text-sm font-medium">
            Tolerance: {tolerance}
            <input
              type="range"
              min={8}
              max={120}
              value={tolerance}
              onChange={(e) => setTolerance(Number(e.target.value))}
              className="mt-2 w-full accent-[var(--color-brand)]"
            />
            <span className="text-xs font-normal text-muted">
              Lower keeps more of the product. Higher also removes light shadows.
            </span>
          </label>
        )}

        {cutoutUrl && (
          <div
            className="flex h-40 items-center justify-center rounded-2xl border border-line"
            style={checker}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={cutoutUrl} alt="cutout" className="max-h-36 w-auto object-contain" />
          </div>
        )}

        {showingNew && (
          <div>
            <p className="mb-2 text-sm font-medium">Colours (matched to the photo, editable)</p>
            <div className="grid grid-cols-3 gap-3">
              {paletteFields.map(([key, label]) => (
                <label key={key} className="text-center text-xs text-muted">
                  <input
                    type="color"
                    value={palette[key]}
                    onChange={(e) => setPalette({ ...palette, [key]: e.target.value })}
                    className="h-10 w-full cursor-pointer rounded-lg border border-line bg-white p-1"
                  />
                  {label}
                </label>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-2">
          <button type="button" onClick={() => save(true)} disabled={!cutoutBlob || busy || status === "processing"} className={btnPrimary}>
            {busy ? "Saving..." : "Approve and publish"}
          </button>
          <button type="button" onClick={() => save(false)} disabled={!cutoutBlob || busy || status === "processing"} className={btnOutline}>
            Save as draft
          </button>
        </div>

        {message && (
          <p
            role={message.tone === "error" ? "alert" : "status"}
            className={`rounded-xl px-4 py-3 text-sm font-medium ${
              message.tone === "error" ? "bg-brand-soft text-brand-dark" : "bg-green-100 text-green-800"
            }`}
          >
            {message.text}
          </p>
        )}
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-medium">Preview (this is how customers will see it)</p>
          <div className="flex gap-1 rounded-full bg-cream p-1 text-xs font-medium">
            {(["ko", "en"] as const).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setLang(l)}
                className={`rounded-full px-3 py-1 ${lang === l ? "bg-brand text-white" : "text-muted"}`}
              >
                {l === "ko" ? "한국어" : "English"}
              </button>
            ))}
          </div>
        </div>
        <PreviewShowcase
          palette={previewPalette}
          imageUrl={previewUrl}
          name={previewName}
          chapters={defaultChapters(lang, previewName)}
        />
        {!previewUrl && (
          <p className="mt-3 text-xs text-muted">
            No animation yet. Upload a photo to build one automatically.
          </p>
        )}
      </div>
    </div>
  );
}