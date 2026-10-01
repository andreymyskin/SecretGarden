import { RichText } from "@/components/RichText";
import { site, texts } from "@/content/site";
import { partsToPlain } from "@/lib/rich-text";
import type { PriceCard } from "@/lib/types";

export function Price({ cards, soft = false }: { cards: PriceCard[]; soft?: boolean }) {
  return (
    <section id="price" className={`section ${soft ? "section-soft" : ""}`}>
      <div className="section-inner">
        <p className="section-eyebrow">Стоимость</p>
        <h2 className="section-title">{texts.price.title}</h2>
        <p className="section-lead">{texts.price.intro}</p>

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          {cards.map((card) => (
            <div key={card.id} className="card p-7">
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-4">
                <h3 className="m-0 font-[family-name:var(--font-display)] text-2xl text-[var(--green)]">{card.title}</h3>
                <p className="m-0 font-[family-name:var(--font-display)] text-2xl text-[var(--rose)]">{card.price}</p>
              </div>
              {partsToPlain(card.description).trim() ? (
                <p className="mt-5 whitespace-pre-line border-t border-[var(--pink-line)] pt-5 text-sm leading-relaxed text-[var(--muted)]">
                  <RichText parts={card.description} />
                </p>
              ) : null}
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-[1.5rem] border border-[var(--pink-line)] bg-white px-7 py-6">
          <p className="m-0 font-[family-name:var(--font-display)] text-xl text-[var(--green)]">
            {texts.contacts.cta}
          </p>
          <a href={site.bookingUrl} target="_blank" rel="noopener noreferrer" className="btn btn-rose">
            Записаться
          </a>
        </div>
      </div>
    </section>
  );
}
