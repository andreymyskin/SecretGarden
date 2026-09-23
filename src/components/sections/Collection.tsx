"use client";

import { useState } from "react";
import type { CollectionItem } from "@/lib/types";
import { Lightbox } from "../Lightbox";

type Props = {
  id: string;
  eyebrow: string;
  title: string;
  intro: string;
  emptyText: string;
  items: CollectionItem[];
  soft?: boolean;
};

/** Grid of cards with covers, each opening its own gallery — used for locations and photo projects. */
export function Collection({ id, eyebrow, title, intro, emptyText, items, soft }: Props) {
  const [active, setActive] = useState<{ item: CollectionItem; index: number } | null>(null);

  const open = (item: CollectionItem) => {
    const photos = item.photos.length > 0
      ? item.photos
      : [{ id: `${item.id}-cover`, url: item.cover, caption: "" }];
    setActive({ item: { ...item, photos }, index: 0 });
  };

  return (
    <section id={id} className={`section ${soft ? "section-soft" : ""}`}>
      <div className="section-inner">
        <p className="section-eyebrow">{eyebrow}</p>
        <h2 className="section-title">{title}</h2>
        <p className="section-lead">{intro}</p>

        {items.length === 0 ? (
          <p className="mt-10 rounded-[1.25rem] border border-dashed border-[var(--pink-deep)] bg-white/70 px-6 py-8 text-center text-[var(--muted)]">
            {emptyText}
          </p>
        ) : (
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <article key={item.id} className="card group flex flex-col overflow-hidden">
                <button
                  type="button"
                  className="relative aspect-[4/5] overflow-hidden text-left"
                  onClick={() => open(item)}
                  aria-label={`Открыть галерею «${item.title}»`}
                >
                  <img
                    src={item.cover}
                    alt={item.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                  />
                  <span className="pill absolute left-4 top-4 bg-white/90 backdrop-blur">
                    {item.photos.length > 0 ? `${item.photos.length} фото` : "Фото"}
                  </span>
                </button>
                <div className="flex flex-1 flex-col p-6">
                  <h3 className="m-0 font-[family-name:var(--font-display)] text-2xl text-[var(--green)]">
                    {item.title}
                  </h3>
                  <p className="mt-2 flex-1 text-[var(--muted)]">{item.description}</p>
                  <button type="button" className="btn btn-ghost btn-sm mt-5 w-fit" onClick={() => open(item)}>
                    Галерея
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {active ? (
        <Lightbox
          photos={active.item.photos}
          index={active.index}
          title={active.item.title}
          onClose={() => setActive(null)}
          onChange={(index) => setActive({ ...active, index })}
        />
      ) : null}
    </section>
  );
}
