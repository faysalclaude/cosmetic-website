"use client";

import {
  motion,
  useTransform,
  type MotionValue,
} from "framer-motion";
import type { Palette } from "@/lib/palette";

export type ShowcaseChapter = { title: string; body: string };

type Props = {
  progress: MotionValue<number>; // 0..1, from scroll or a timer
  palette: Palette;
  imageUrl?: string;
  name: string;
  chapters: ShowcaseChapter[];
  ctaLabel?: string;
  onCta?: () => void;
};

const PARTICLES = Array.from({ length: 14 }, (_, i) => ({
  left: (i * 37) % 100,
  top: (i * 53) % 100,
  size: 4 + ((i * 7) % 9),
  delay: (i % 5) * 0.6,
  duration: 5 + (i % 4),
}));

function Chapter({
  index,
  total,
  chapter,
  progress,
}: {
  index: number;
  total: number;
  chapter: ShowcaseChapter;
  progress: MotionValue<number>;
}) {
  const from = index / total;
  const to = (index + 1) / total;
  const fade = (to - from) / 4;
  const opacity = useTransform(
    progress,
    [from, from + fade, to - fade, to],
    [0, 1, 1, 0],
  );
  const y = useTransform(progress, [from, from + fade, to - fade, to], [24, 0, 0, -24]);
  const alignRight = index % 2 === 1;

  return (
    <motion.div
      style={{ opacity, y }}
      className={`pointer-events-none absolute inset-x-0 bottom-10 px-6 md:inset-y-0 md:flex md:items-center md:bottom-auto ${
        alignRight ? "md:justify-end md:pr-[8vw]" : "md:justify-start md:pl-[8vw]"
      }`}
    >
      <div className="max-w-sm text-center md:max-w-md md:text-left">
        <p className="mb-2 text-xs font-semibold tracking-[0.3em] uppercase opacity-60">
          {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </p>
        <h3 className="text-3xl leading-tight font-bold md:text-5xl">
          {chapter.title}
        </h3>
        <p className="mt-3 leading-relaxed opacity-75">{chapter.body}</p>
      </div>
    </motion.div>
  );
}

export default function ShowcaseStage({
  progress,
  palette,
  imageUrl,
  name,
  chapters,
  ctaLabel,
  onCta,
}: Props) {
  // Product motion tied to progress
  const scale = useTransform(progress, [0, 0.35, 0.7, 1], [0.85, 1.25, 1.05, 1.3]);
  const rotate = useTransform(progress, [0, 0.5, 1], [-6, 5, -3]);
  const y = useTransform(progress, [0, 0.5, 1], [30, -20, 10]);
  const glowScale = useTransform(progress, [0, 0.5, 1], [0.7, 1.4, 1.9]);
  const glowOpacity = useTransform(progress, [0, 0.3, 1], [0.35, 0.8, 0.55]);
  const bgShift = useTransform(progress, [0, 1], [0, 100]);
  const ctaOpacity = useTransform(progress, [0.88, 0.97], [0, 1]);
  const barScale = useTransform(progress, [0, 1], [0, 1]);

  return (
    <div
      className="relative h-full w-full overflow-hidden"
      style={{
        background: `linear-gradient(160deg, ${palette.soft} 0%, ${palette.soft} 40%, ${palette.accent}33 100%)`,
        color: palette.deep,
      }}
    >
      {/* soft moving colour wash */}
      <motion.div
        style={{
          x: bgShift,
          background: `radial-gradient(circle at 30% 30%, ${palette.accent}40, transparent 55%)`,
        }}
        className="absolute -inset-1/4"
      />

      {/* glow behind the product */}
      <motion.div
        style={{
          scale: glowScale,
          opacity: glowOpacity,
          background: `radial-gradient(circle, ${palette.accent}, transparent 65%)`,
        }}
        className="absolute top-1/2 left-1/2 h-[60vmin] w-[60vmin] -translate-x-1/2 -translate-y-1/2 rounded-full blur-2xl"
      />

      {/* ripple rings (the 'drop' feel) */}
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="absolute top-[62%] left-1/2 rounded-full border"
          style={{
            borderColor: palette.accent,
            width: "40vmin",
            height: "12vmin",
            x: "-50%",
            y: "-50%",
          }}
          animate={{ scale: [0.4, 1.8], opacity: [0.7, 0] }}
          transition={{
            duration: 3.2,
            repeat: Infinity,
            delay: i * 1.05,
            ease: "easeOut",
          }}
        />
      ))}

      {/* floating particles */}
      {PARTICLES.map((p, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            width: p.size,
            height: p.size,
            background: palette.accent,
            opacity: 0.35,
          }}
          animate={{ y: [0, -24, 0], opacity: [0.15, 0.5, 0.15] }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* the product */}
      <motion.div
        style={{ scale, rotate, y }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
      >
        <motion.div
          animate={{ y: [-8, 8, -8] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        >
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageUrl}
              alt={name}
              className="max-h-[52vh] w-auto max-w-[70vw] object-contain drop-shadow-[0_30px_40px_rgba(0,0,0,0.25)]"
            />
          ) : (
            <svg viewBox="0 0 120 200" className="h-[46vh] drop-shadow-xl" aria-label={name}>
              <rect x="40" y="6" width="40" height="28" rx="6" fill={palette.deep} />
              <rect x="28" y="32" width="64" height="152" rx="14" fill="#ffffff" stroke={palette.accent} strokeOpacity="0.4" strokeWidth="2" />
              <rect x="38" y="82" width="44" height="56" rx="4" fill={palette.accent} />
              <rect x="46" y="96" width="28" height="4" rx="2" fill="#ffffff" />
              <rect x="46" y="106" width="20" height="4" rx="2" fill="#ffffff" opacity="0.7" />
            </svg>
          )}
        </motion.div>
      </motion.div>

      {/* chapters */}
      {chapters.map((c, i) => (
        <Chapter
          key={c.title}
          index={i}
          total={chapters.length}
          chapter={c}
          progress={progress}
        />
      ))}

      {/* final call to action */}
      {ctaLabel && (
        <motion.div
          style={{ opacity: ctaOpacity }}
          className="absolute inset-x-0 top-8 flex justify-center"
        >
          <button
            onClick={onCta}
            className="rounded-full px-8 py-3 text-sm font-semibold text-white shadow-lg"
            style={{ background: palette.deep }}
          >
            {ctaLabel}
          </button>
        </motion.div>
      )}

      {/* progress bar */}
      <motion.div
        style={{ scaleX: barScale, background: palette.accent }}
        className="absolute bottom-0 left-0 h-1 w-full origin-left"
      />
    </div>
  );
}