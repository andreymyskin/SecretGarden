import type { Metadata } from "next";
import { DocumentPage } from "@/components/DocumentPage";
import { ofertaParagraphs, ofertaTitle } from "@/content/oferta";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: ofertaTitle,
  description:
    "Договор публичной оферты на краткосрочную аренду фотостудии Secret Garden («Тайный Сад») в Рязани: условия бронирования, оплаты, отмены и правила пользования помещением.",
  alternates: { canonical: "/oferta" },
  openGraph: { title: `${ofertaTitle} — Secret Garden`, url: "/oferta" },
};

export default function OfertaPage() {
  return <DocumentPage title={ofertaTitle} paragraphs={ofertaParagraphs} />;
}
