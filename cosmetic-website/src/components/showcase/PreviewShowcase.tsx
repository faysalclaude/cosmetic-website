"use client";

import { useEffect } from "react";
import { animate, useMotionValue } from "framer-motion";
import ShowcaseStage, { type ShowcaseChapter } from "./ShowcaseStage";
import type { Palette } from "@/lib/palette";

type Props = {
  palette: Palette;
  imageUrl?: string;
  name: string;
  chapters: ShowcaseChapter[];
};

export default function PreviewShowcase(props: Props) {
  const progress = useMotionValue(0);

  useEffect(() => {
    const controls = animate(progress, 1, {
      duration: 12,
      ease: "linear",
      repeat: Infinity,
      repeatType: "reverse",
    });
    return () => controls.stop();
  }, [progress]);

  return (
    <div className="h-[560px] overflow-hidden rounded-3xl border border-line">
      <ShowcaseStage progress={progress} {...props} />
    </div>
  );
}