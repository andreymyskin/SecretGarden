import type { Metadata } from "next";
import { DocumentPage } from "@/components/DocumentPage";
import { privacyEffectiveDate, privacyParagraphs, privacyTitle } from "@/content/privacy";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: privacyTitle,
  description:
    "Политика конфиденциальности фотостудии Secret Garden («Тайный Сад», Рязань): какие персональные данные обрабатываются при бронировании, для каких целей, как защищаются и какие права есть у посетителей.",
  alternates: { canonical: "/privacy" },
  openGraph: { title: `${privacyTitle} — Secret Garden`, url: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <DocumentPage
      title={privacyTitle}
      paragraphs={privacyParagraphs}
      meta={`Редакция от ${privacyEffectiveDate}`}
    />
  );
}
