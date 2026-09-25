"use client";

import { useCallback, useEffect } from "react";
import type { Photo } from "@/lib/types";

type Props = {
  photos: Photo[];
  index: number;
  title?: string;
  onClose: () => void;
  onChange: (index: number) => void;
};

export function Lightbox({ photos, index, title, onClose, onChange }: Props) {
  const photo = photos[index];
  const hasMany = photos.length > 1;

  const prev = useCallback(
    () => onChange((index - 1 + photos.length) % photos.length),
    [index, photos.length, onChange],
  );
  const next = useCallback(
    () => onChange((index + 1) % photos.length),
    [index, photos.length, onChange],
  );

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft" && hasMany) prev();
      if (event.key === "ArrowRight" && hasMany) next();
    };
    document.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [hasMany, next, onClose, prev]);

  if (!photo) return null;

  return (
    <div
      className="fixed inset-0 z-[80] flex flex-col bg-[rgba(43,47,44,0.9)] backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={title || photo.caption || "Фотография"}
      onClick={onClose}
    >
      <div className="flex items-center justify-between gap-4 px-5 py-4 text-white">
        <div className="min-w-0">
          {title ? <p className="truncate font-[family-name:var(--font-display)] text-xl">{title}</p> : null}
          <p className="text-sm text-white/70">
            {index + 1} / {photos.length}
            {photo.caption ? ` · ${photo.caption}` : ""}
          </p>
        </div>
        <button
          type="button"
          className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/10 text-2xl leading-none hover:bg-white/20"
          aria-label="Закрыть"
          onClick={onClose}
        >
          ×
        </button>
      </div>

      <div className="relative flex flex-1 items-center justify-center px-4 pb-6" onClick={(e) => e.stopPropagation()}>
        <img
          key={photo.id}
          src={photo.url}
          alt={photo.caption || `${title || "Фотография"} — фотостудия Secret Garden, Рязань`}
          className="max-h-[80vh] max-w-full rounded-2xl object-contain shadow-2xl"
        />
        {hasMany ? (
          <>
            <button
              type="button"
              onClick={prev}
              aria-label="Предыдущее фото"
              className="absolute left-3 top-1/2 inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-2xl text-white hover:bg-white/30 md:left-8"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Следующее фото"
              className="absolute right-3 top-1/2 inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-2xl text-white hover:bg-white/30 md:right-8"
            >
              ›
            </button>
          </>
        ) : null}
      </div>
    </div>
  );
}
