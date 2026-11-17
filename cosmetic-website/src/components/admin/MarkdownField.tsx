"use client";

import { useState } from "react";
import Markdown from "@/components/blog/Markdown";

type Props = { label: string; name: string; defaultValue: string; rows?: number };

export default function MarkdownField({ label, name, defaultValue, rows = 16 }: Props) {
  const [text, setText] = useState(defaultValue);
  const [preview, setPreview] = useState(false);

  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{label}</span>
        <button
          type="button"
          onClick={() => setPreview((v) => !v)}
          className="rounded-full border border-line px-3 py-1 text-xs font-medium hover:border-brand hover:text-brand"
        >
          {preview ? "Edit" : "Preview"}
        </button>
      </div>
      {/* the textarea stays in the page while previewing so its text is still saved */}
      <textarea
        name={name}
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={rows}
        className={`mt-1.5 w-full rounded-xl border border-line bg-white px-4 py-2.5 font-mono text-sm outline-none transition-colors focus:border-brand ${
          preview ? "hidden" : ""
        }`}
      />
      {preview && (
        <div className="mt-1.5 min-h-40 rounded-xl border border-line bg-white p-5">
          <Markdown>{text || "_Nothing to preview yet._"}</Markdown>
        </div>
      )}
    </div>
  );
}