"use client";

import { useEffect, useState } from "react";
import type { GalleryItem } from "@/lib/types";

export function Gallery() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [active, setActive] = useState<GalleryItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const response = await fetch("/api/gallery", { cache: "no-store" });
        const data = (await response.json()) as { items: GalleryItem[] };
        if (!cancelled) setItems(data.items || []);
      } catch {
        if (!cancelled) setItems([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section id="works" className="section">
      <div className="section-inner">
        <p className="section-eyebrow">Наши работы</p>
        <h2 className="section-title">Фотогалерея сада</h2>
        <p className="section-lead">
          Подборка съёмок в пространстве Secret Garden. Галерея обновляется
          через раздел администратора.
        </p>

        {loading ? (
          <p className="mt-10 text-[var(--muted)]">Загружаем работы…</p>
        ) : items.length === 0 ? (
          <p className="mt-10 text-[var(--muted)]">
            Пока нет опубликованных работ. Добавьте первую в админ-панели.
          </p>
        ) : (
          <div className="mt-10 columns-1 gap-5 sm:columns-2 lg:columns-3">
            {items.map((item, index) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActive(item)}
                className="mb-5 w-full break-inside-avoid overflow-hidden rounded-[1.5rem] text-left transition duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow)]"
                style={{ animationDelay: `${index * 60}ms` }}
              >
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full object-cover transition duration-500 hover:scale-[1.03]"
                />
                <div className="bg-[rgba(255,255,255,0.55)] px-4 py-3 backdrop-blur-sm">
                  <h3 className="font-[family-name:var(--font-display)] text-xl">
                    {item.title}
                  </h3>
                  {item.description ? (
                    <p className="mt-1 text-sm text-[var(--muted)]">
                      {item.description}
                    </p>
                  ) : null}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {active ? (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-[rgba(47,61,54,0.55)] p-4 backdrop-blur-sm"
          onClick={() => setActive(null)}
          role="dialog"
          aria-modal="true"
          aria-label={active.title}
        >
          <div
            className="w-[min(900px,100%)] overflow-hidden rounded-[1.75rem] bg-[var(--surface-strong)] shadow-[var(--shadow)]"
            onClick={(event) => event.stopPropagation()}
          >
            <img
              src={active.imageUrl}
              alt={active.title}
              className="max-h-[70vh] w-full object-cover"
            />
            <div className="flex items-start justify-between gap-4 p-5">
              <div>
                <h3 className="font-[family-name:var(--font-display)] text-2xl">
                  {active.title}
                </h3>
                {active.description ? (
                  <p className="mt-2 text-[var(--muted)]">{active.description}</p>
                ) : null}
              </div>
              <button
                type="button"
                className="btn btn-ghost !min-h-10 !px-4"
                onClick={() => setActive(null)}
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
