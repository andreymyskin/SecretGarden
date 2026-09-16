"use client";

import { useState } from "react";
import { texts } from "@/content/site";
import type { Zone } from "@/lib/types";
import { Lightbox } from "../Lightbox";

export function Zones({ zones }: { zones: Zone[] }) {
  const [active, setActive] = useState<{ zone: Zone; index: number } | null>(null);

  return (
    <section id="zones" className="section section-soft">
      <div className="section-inner">
        <p className="section-eyebrow">Зоны</p>
        <h2 className="section-title">{texts.zones.title}</h2>
        <p className="section-lead">{texts.zones.intro}</p>

        {zones.length === 0 ? (
          <p className="mt-10 text-[var(--muted)]">Зоны скоро появятся.</p>
        ) : (
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {zones.map((zone) => {
              const gallery = zone.photos.length > 0
                ? zone.photos
                : [{ id: `${zone.id}-cover`, url: zone.cover, caption: "" }];
              return (
                <article key={zone.id} className="card group flex flex-col overflow-hidden">
                  <button
                    type="button"
                    className="relative aspect-[4/5] overflow-hidden text-left"
                    onClick={() => setActive({ zone: { ...zone, photos: gallery }, index: 0 })}
                    aria-label={`Открыть галерею «${zone.title}»`}
                  >
                    <img
                      src={zone.cover}
                      alt={zone.title}
                      loading="lazy"
                      className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                    />
                    <span className="absolute left-4 top-4 pill bg-white/90 backdrop-blur">
                      {zone.photos.length > 0 ? `${zone.photos.length} фото` : "Фото"}
                    </span>
                  </button>
                  <div className="flex flex-1 flex-col p-6">
                    <h3 className="m-0 font-[family-name:var(--font-display)] text-2xl text-[var(--green)]">
                      {zone.title}
                    </h3>
                    <p className="mt-2 flex-1 text-[var(--muted)]">{zone.description}</p>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm mt-5 w-fit"
                      onClick={() => setActive({ zone: { ...zone, photos: gallery }, index: 0 })}
                    >
                      Галерея
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {active ? (
        <Lightbox
          photos={active.zone.photos}
          index={active.index}
          title={active.zone.title}
          onClose={() => setActive(null)}
          onChange={(index) => setActive({ ...active, index })}
        />
      ) : null}
    </section>
  );
}
