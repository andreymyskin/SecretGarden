import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { ofertaParagraphs, ofertaTitle } from "@/content/oferta";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: `${ofertaTitle} — Secret Garden`,
  description: "Договор оферты на аренду фотостудии Secret Garden в Рязани.",
};

const headingPattern = /^\d+\.\s[А-ЯЁ]/;

export default function OfertaPage() {
  return (
    <>
      <Header />
      <main className="section pt-32 md:pt-40">
        <div className="section-inner max-w-3xl">
          <Link href="/" className="text-sm text-[var(--muted)] hover:text-[var(--green)]">
            ← На главную
          </Link>
          <p className="section-eyebrow mt-6">Документы</p>
          <h1 className="section-title">{ofertaTitle}</h1>
          <div className="prose mt-8 text-[var(--ink)]">
            {ofertaParagraphs.map((paragraph, index) =>
              headingPattern.test(paragraph) && paragraph.length < 60 ? (
                <h2
                  key={index}
                  className="mb-3 mt-10 font-[family-name:var(--font-display)] text-2xl text-[var(--green)]"
                >
                  {paragraph}
                </h2>
              ) : (
                <p key={index} className="text-[0.98rem] leading-relaxed text-[var(--ink)]">
                  {paragraph}
                </p>
              ),
            )}
            <p className="mt-6 text-[0.98rem] leading-relaxed">
              {site.owner}
              <br />
              ИНН {site.inn}
              <br />
              <a href={`mailto:${site.email}`} className="text-[var(--rose)]">{site.email}</a>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
