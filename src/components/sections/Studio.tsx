import { site, texts } from "@/content/site";
import type { Photo } from "@/lib/types";
import { PhotoGrid } from "../PhotoGrid";

export function Studio({ photos }: { photos: Photo[] }) {
  const [first, second, third] = photos;

  return (
    <section id="studio" className="section pt-32 md:pt-40">
      <div className="section-inner">
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <p className="reveal section-eyebrow">Фотостудия в Рязани</p>
            <h1 className="reveal reveal-delay-1 m-0 font-[family-name:var(--font-display)] text-[clamp(2.6rem,6vw,4.4rem)] font-medium leading-[1.05] tracking-[-0.03em] text-[var(--green)]">
              Тайный Сад
              <span className="block text-[var(--rose)]">Secret Garden</span>
            </h1>
            <p className="reveal reveal-delay-2 mt-4 text-xl font-medium text-[var(--ink)] md:text-2xl">
              {site.tagline}
            </p>
            <p className="reveal reveal-delay-2 mt-4 max-w-xl text-[1.05rem] text-[var(--muted)]">
              {texts.studio.intro}
            </p>
            <div className="reveal reveal-delay-3 mt-8 flex flex-wrap gap-3">
              <a href={site.bookingUrl} target="_blank" rel="noopener noreferrer" className="btn">
                Записаться
              </a>
              <a href="#zones" className="btn btn-ghost">
                Смотреть зоны
              </a>
            </div>
            <div className="reveal reveal-delay-3 mt-10 flex flex-wrap gap-x-8 gap-y-3 text-sm text-[var(--muted)]">
              <span><strong className="text-[var(--green)]">9</strong> фотозон</span>
              <span><strong className="text-[var(--green)]">49 м²</strong> в старинном здании</span>
              <span><strong className="text-[var(--green)]">до 5</strong> человек в студии</span>
            </div>
          </div>

          <div className="relative grid grid-cols-[1.2fr_0.8fr] gap-4">
            <div
              className="pointer-events-none absolute -left-8 -top-8 h-40 w-40 rounded-full bg-[var(--pink)] blur-2xl"
              style={{ animation: "float 7s ease-in-out infinite" }}
            />
            {first ? (
              <img
                src={first.url}
                alt={first.caption || site.fullName}
                className="reveal relative row-span-2 aspect-[3/4] w-full rounded-[1.75rem] border border-[var(--pink-line)] object-cover shadow-[var(--shadow)]"
              />
            ) : (
              <div className="row-span-2 aspect-[3/4] rounded-[1.75rem] bg-[var(--pink)]" />
            )}
            {second ? (
              <img
                src={second.url}
                alt={second.caption || site.fullName}
                className="reveal reveal-delay-1 relative aspect-[4/5] w-full rounded-[1.5rem] border border-[var(--pink-line)] object-cover shadow-[var(--shadow-soft)]"
              />
            ) : (
              <div className="aspect-[4/5] rounded-[1.5rem] bg-[var(--pink)]" />
            )}
            <div className="reveal reveal-delay-2 relative flex items-center justify-center overflow-hidden rounded-[1.5rem] border border-[var(--pink-line)] bg-white p-5 shadow-[var(--shadow-soft)]">
              <img
                src="/brand/logo-green.png"
                alt="Secret Garden Photostudio"
                className="w-full max-w-[180px]"
              />
              {third ? (
                <img
                  src={third.url}
                  alt=""
                  aria-hidden
                  className="absolute inset-0 -z-10 h-full w-full object-cover opacity-[0.08]"
                />
              ) : null}
            </div>
          </div>
        </div>

        <div className="mt-20">
          <p className="section-eyebrow">Студия</p>
          <h2 className="section-title">Атмосфера, в которой оживает история</h2>
          <p className="section-lead">
            Работы, снятые в нашем пространстве. Раздел обновляется через админ-панель.
          </p>
          <PhotoGrid photos={photos} title="Студия" variant="strip" />
        </div>
      </div>
    </section>
  );
}
