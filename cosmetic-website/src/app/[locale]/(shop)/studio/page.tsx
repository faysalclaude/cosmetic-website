"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale } from "next-intl";
import { removeBackgroundFromFile, type RemoveMode } from "@/lib/bg-removal";
import { defaultPalette, extractPalette, type Palette } from "@/lib/palette";
import {
  blobToDataUrl,
  clearShowcases,
  saveShowcase,
  useApprovedShowcases,
} from "@/lib/showcase-store";
import PreviewShowcase from "@/components/showcase/PreviewShowcase";
import { defaultChapters } from "@/components/showcase/copy";

type Status = "idle" | "processing" | "ready" | "error";

const checker: React.CSSProperties = {
  backgroundImage:
    "linear-gradient(45deg,#e5e5e5 25%,transparent 25%),linear-gradient(-45deg,#e5e5e5 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#e5e5e5 75%),linear-gradient(-45deg,transparent 75%,#e5e5e5 75%)",
  backgroundSize: "16px 16px",
  backgroundPosition: "0 0,0 8px,8px -8px,-8px 0",
};

export default function StudioPage() {
  const locale = useLocale();
  const approved = useApprovedShowcases();
  const inputRef = useRef<HTMLInputElement>(null);
  const runId = useRef(0);

  const [file, setFile] = useState<File | null>(null);
  const [mode, setMode] = useState<RemoveMode>("studio");
  const [tolerance, setTolerance] = useState(38);

  const [status, setStatus] = useState<Status>("idle");
  const [percent, setPercent] = useState(0);
  const [name, setName] = useState("Signature Serum");
  const [cutoutUrl, setCutoutUrl] = useState<string>();
  const [cutoutBlob, setCutoutBlob] = useState<Blob>();
  const [palette, setPalette] = useState<Palette>(defaultPalette);
  const [message, setMessage] = useState("");

  // The slider only matters in studio mode; do not re-run the AI when it moves.
  const effectiveTolerance = mode === "studio" ? tolerance : 0;

  useEffect(() => {
    if (!file) return;
    const id = ++runId.current;

    const timer = setTimeout(
      async () => {
        setStatus("processing");
        setPercent(0);
        setMessage("");
        try {
          const blob = await removeBackgroundFromFile(file, {
            mode,
            tolerance: effectiveTolerance,
            onProgress: setPercent,
          });
          if (id !== runId.current) return;

          const url = URL.createObjectURL(blob);
          const colours = await extractPalette(url);
          if (id !== runId.current) {
            URL.revokeObjectURL(url);
            return;
          }
          setCutoutBlob(blob);
          setCutoutUrl(url);
          setPalette(colours);
          setStatus("ready");
          setMessage("Cutout ready. Check the edges, adjust if needed, then approve.");
        } catch (err) {
          if (id !== runId.current) return;
          console.error(err);
          setStatus("error");
          setMessage(
            err instanceof Error ? err.message : "Background removal failed.",
          );
        }
      },
      mode === "studio" ? 250 : 0,
    );

    return () => clearTimeout(timer);
  }, [file, mode, effectiveTolerance]);

  // free the object URL when it is replaced
  useEffect(() => {
    return () => {
      if (cutoutUrl) URL.revokeObjectURL(cutoutUrl);
    };
  }, [cutoutUrl]);

  async function approve() {
    if (!cutoutBlob) return;
    const dataUrl = await blobToDataUrl(cutoutBlob);
    const ok = saveShowcase({
      id: crypto.randomUUID(),
      name,
      imageDataUrl: dataUrl,
      palette,
      approvedAt: new Date().toISOString(),
    });
    setMessage(
      ok
        ? "Approved. Open the Home page to see it live."
        : "Could not save (image too large for browser storage). Try a smaller photo.",
    );
  }

  const chapters = defaultChapters(locale, name);

  return (
    <div className="container-page py-12">
      <h1 className="text-3xl font-bold">Product Studio (prototype)</h1>
      <p className="mt-2 max-w-2xl text-muted">
        Upload one product photo. The background is removed in your browser, the
        colours are picked from the product, and an animation is built
        automatically. Approve it to show it on the Home page.
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[360px_1fr]">
        <div className="space-y-5">
          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="hidden"
          />
          <button
            onClick={() => inputRef.current?.click()}
            disabled={status === "processing"}
            className="w-full rounded-2xl border-2 border-dashed border-line bg-cream py-10 text-sm font-medium hover:border-brand disabled:opacity-60"
          >
            {status === "processing"
              ? mode === "ai"
                ? `Removing background... ${percent}%`
                : "Removing background..."
              : file
                ? `Selected: ${file.name} (click to change)`
                : "Click to upload a product photo"}
          </button>

          <div>
            <p className="mb-2 text-sm font-medium">Background removal</p>
            <div className="grid grid-cols-2 gap-2 rounded-full bg-cream p-1 text-sm font-medium">
              {(["studio", "ai"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`rounded-full py-2 ${
                    mode === m ? "bg-brand text-white" : "text-muted"
                  }`}
                >
                  {m === "studio" ? "Studio (plain background)" : "AI (any background)"}
                </button>
              ))}
            </div>
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
              className="flex h-48 items-center justify-center rounded-2xl border border-line"
              style={checker}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={cutoutUrl} alt="cutout" className="max-h-44 w-auto object-contain" />
            </div>
          )}

          <label className="block text-sm font-medium">
            Product name
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-line px-3 py-2"
            />
          </label>

          <div>
            <p className="mb-2 text-sm font-medium">Detected colours</p>
            <div className="flex gap-2">
              {Object.entries(palette).map(([k, v]) => (
                <div key={k} className="text-center text-xs">
                  <div
                    className="h-10 w-10 rounded-full border border-line"
                    style={{ background: v }}
                  />
                  <span className="text-muted">{k}</span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={approve}
            disabled={status !== "ready"}
            className="w-full rounded-full bg-brand py-3 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-40"
          >
            Approve and publish to Home
          </button>

          {message && <p className="text-sm text-brand">{message}</p>}

          {approved.length > 0 && (
            <button onClick={clearShowcases} className="text-xs text-muted underline">
              Remove approved showcases ({approved.length})
            </button>
          )}
        </div>

        <PreviewShowcase
          palette={palette}
          imageUrl={cutoutUrl}
          name={name}
          chapters={chapters}
        />
      </div>

      <p className="mt-6 text-xs text-muted">
        Prototype note: approvals are saved in this browser only. In a later
        phase they move to the database with admin-only access.
      </p>
    </div>
  );
}