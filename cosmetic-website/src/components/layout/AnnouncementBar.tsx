import { useTranslations } from "next-intl";

export default function AnnouncementBar() {
  const t = useTranslations("Announcement");
  return (
    <div className="font-serif text-xl font-semibold tracking-[0.35em] text-brand-dark">
      {t("text")}
    </div>
  );
}