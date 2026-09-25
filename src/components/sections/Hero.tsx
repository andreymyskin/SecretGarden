import { site, texts } from "@/content/site";
import type { Photo } from "@/lib/types";
import { StrengthIcon } from "../StrengthIcon";

type Props = { photos: Photo[]; locationsVisible: boolean };

export function Hero({ photos, locationsVisible }: Props) {
  const [first, second] = photos;

  return (
    <section id="hero" className="section pt-32 pb-0 md:pt-40">
      <div className="section-inner">
        <div className="grid items-start gap-12 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <p className="reveal section-eyebrow">Фотостудия в Рязани</p>
            <h1 className="reveal reveal-delay-1 m-0 font-[family-name:var(--font-display)] text-[clamp(2.6rem,6vw,4.4rem)] font-medium leading-[1.05] tracking-[-0.03em] text-[var(--green)]">
              Тайный Сад
              <span className="block text-[var(--rose)]">Secret Garden</span>
            </h1>

            <ul className="reveal reveal-delay-2 m-0 mt-7 grid list-none gap-3.5 p-0">
              {texts.studio.strengths.map((item) => (
                <li key={item.text} className="flex items-start gap-3.5">
                  <span className="mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--pink-line)] bg-[var(--pink)] text-[var(--green)]">
                    <StrengthIcon name={item.icon} className="h-5 w-5" />
                  </span>
                  <span className="pt-1.5 text-[0.98rem] leading-snug text-[var(--ink)]">{item.text}</span>
                </li>
              ))}
            </ul>

            <div className="reveal reveal-delay-3 mt-8 flex flex-wrap gap-3">
              <a href={site.bookingUrl} target="_blank" rel="noopener noreferrer" className="btn">
                Записаться
              </a>
              {locationsVisible ? (
                <a href="#locations" className="btn btn-ghost">
                  Смотреть локации
                </a>
              ) : (
                <a href="#price" className="btn btn-ghost">
                  Стоимость
                </a>
              )}
            </div>
          </div>

          <div className="relative grid grid-cols-[1.2fr_0.8fr] gap-4 lg:sticky lg:top-28">
            <div
              className="pointer-events-none absolute -left-8 -top-8 h-40 w-40 rounded-full bg-[var(--pink)] blur-2xl"
              style={{ animation: "float 7s ease-in-out infinite" }}
            />
            {first ? (
              <img
                src={first.url}
                alt={first.caption || `${site.fullName} — интерьер студии`}
                fetchPriority="high"
                className="reveal relative row-span-2 aspect-[3/4] w-full rounded-[1.75rem] border border-[var(--pink-line)] object-cover shadow-[var(--shadow)]"
              />
            ) : (
              <div className="row-span-2 aspect-[3/4] rounded-[1.75rem] bg-[var(--pink)]" />
            )}
            {second ? (
              <img
                src={second.url}
                alt={second.caption || `${site.fullName} — фотосессия в студии`}
                className="reveal reveal-delay-1 relative aspect-[4/5] w-full rounded-[1.5rem] border border-[var(--pink-line)] object-cover shadow-[var(--shadow-soft)]"
              />
            ) : (
              <div className="aspect-[4/5] rounded-[1.5rem] bg-[var(--pink)]" />
            )}
            <div className="reveal reveal-delay-2 relative flex items-center justify-center overflow-hidden rounded-[1.5rem] border border-[var(--pink-line)] bg-white p-5 shadow-[var(--shadow-soft)]">
              <img
                src="/brand/logo-green.png"
                alt="Secret Garden Photostudio"
                width={744}
                height={619}
                className="h-auto w-full max-w-[180px]"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
