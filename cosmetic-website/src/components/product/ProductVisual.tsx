import Image from "next/image";

type Props = {
  tint: string;
  accent: string;
  label: string;
  className?: string;
  src?: string;
};

export default function ProductVisual({
  tint,
  accent,
  label,
  className = "",
  src,
}: Props) {
  return (
    <div
      role="img"
      aria-label={label}
      className={`relative flex items-center justify-center overflow-hidden ${className}`}
      style={{ background: `linear-gradient(145deg, ${tint}, #ffffff)` }}
    >
      {src ? (
        <Image
          src={src}
          alt=""
          fill
          sizes="(min-width: 1024px) 33vw, 100vw"
          className="object-contain p-5"
        />
      ) : (
        <svg viewBox="0 0 120 200" className="h-4/5 drop-shadow-md" aria-hidden>
          <rect x="40" y="6" width="40" height="28" rx="6" fill="#2b2326" />
          <rect x="28" y="32" width="64" height="152" rx="14" fill="#ffffff" stroke="#e7d6dc" strokeWidth="2" />
          <rect x="38" y="82" width="44" height="56" rx="4" fill={accent} opacity="0.9" />
          <rect x="46" y="96" width="28" height="4" rx="2" fill="#ffffff" />
          <rect x="46" y="106" width="20" height="4" rx="2" fill="#ffffff" opacity="0.7" />
        </svg>
      )}
    </div>
  );
}