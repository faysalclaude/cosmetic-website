import type { ShowcaseChapter } from "./ShowcaseStage";

export function defaultChapters(
  locale: string,
  name: string,
): ShowcaseChapter[] {
  if (locale === "en") {
    return [
      { title: name, body: "A clinical formulation made for your daily routine." },
      { title: "Close to your skin", body: "Absorbs lightly and finishes fresh." },
      { title: "Clear, even-looking skin", body: "Make it part of your everyday care." },
    ];
  }
  return [
    { title: name, body: "매일의 루틴을 위한 임상 처방 스킨케어." },
    { title: "피부 가까이", body: "가볍게 스며들어 산뜻하게 마무리됩니다." },
    { title: "맑고 고른 피부결", body: "일상의 케어로 더 건강한 피부 컨디션을 만나보세요." },
  ];
}