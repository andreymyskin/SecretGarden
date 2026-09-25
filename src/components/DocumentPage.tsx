import Link from "next/link";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { site, visibleNav } from "@/content/site";
import { getContent } from "@/lib/content";

type Props = {
  eyebrow?: string;
  title: string;
  paragraphs: string[];
  /** Optional line shown under the title, e.g. the document's effective date. */
  meta?: string;
};

const headingPattern = /^\d+\.\s[А-ЯЁ]/;

/** Long-form legal document layout shared by the offer agreement and the privacy policy. */
export async function DocumentPage({ eyebrow = "Документы", title, paragraphs, meta }: Props) {
  const content = await getContent();
  const links = visibleNav(content.sections);

  return (
    <>
      <Header links={links} />
      <main className="section pt-32 md:pt-40">
        <article className="section-inner max-w-3xl">
          <Link href="/" className="text-sm text-[var(--muted)] hover:text-[var(--green)]">
            ← На главную
          </Link>
          <p className="section-eyebrow mt-6">{eyebrow}</p>
          <h1 className="section-title">{title}</h1>
          {meta ? <p className="m-0 text-sm text-[var(--muted)]">{meta}</p> : null}
          <div className="prose mt-8 text-[var(--ink)]">
            {paragraphs.map((paragraph, index) =>
              headingPattern.test(paragraph) && paragraph.length < 80 ? (
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
              <a href={`mailto:${site.email}`} className="text-[var(--rose)]">
                {site.email}
              </a>
            </p>
          </div>
        </article>
      </main>
      <Footer links={links} />
    </>
  );
}
