"use client";

import { useRef } from "react";
import { useScroll } from "framer-motion";
import ShowcaseStage, { type ShowcaseChapter } from "./ShowcaseStage";
import type { Palette } from "@/lib/palette";

type Props = {
  palette: Palette;
  imageUrl?: string;
  name: string;
  chapters: ShowcaseChapter[];
  ctaLabel?: string;
  onCta?: () => void;
  heightVh?: number;
};

export default function ScrollShowcase({ heightVh = 400, ...rest }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  return (
    <section ref={ref} style={{ height: `${heightVh}vh` }} className="relative">
      <div className="sticky top-0 h-screen w-full">
        <ShowcaseStage progress={scrollYProgress} {...rest} />
      </div>
    </section>
  );
}