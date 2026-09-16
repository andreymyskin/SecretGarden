"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Photo } from "@/lib/types";
import { Lightbox } from "./Lightbox";

type Props = {
  photos: Photo[];
  title?: string;
  emptyText?: string;
};

const COPIES = 3;

/**
 * Horizontal, endlessly looping photo strip. The list is rendered three
 * times; the viewport starts on the middle copy and silently jumps by one
 * copy width whenever it drifts into the first or last copy.
 */
export function PhotoStrip({ photos, title, emptyText }: Props) {
  const [active, setActive] = useState<number | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);

  const copyWidth = useCallback(() => {
    const track = trackRef.current;
    if (!track) return 0;
    return track.scrollWidth / COPIES;
  }, []);

  const recenter = useCallback(() => {
    const track = trackRef.current;
    const width = copyWidth();
    if (!track || width === 0) return;
    const { scrollLeft } = track;
    if (scrollLeft < width * 0.5 || scrollLeft > width * 1.5) {
      const previous = track.style.scrollBehavior;
      track.style.scrollBehavior = "auto";
      track.scrollLeft = scrollLeft < width * 0.5 ? scrollLeft + width : scrollLeft - width;
      track.style.scrollBehavior = previous;
    }
  }, [copyWidth]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track || photos.length === 0) return;
    track.style.scrollBehavior = "auto";
    track.scrollLeft = copyWidth();
    track.style.scrollBehavior = "";

    const onScroll = () => {
      if (rafRef.current !== null) return;
      rafRef.current = window.requestAnimationFrame(() => {
        rafRef.current = null;
        recenter();
      });
    };
    track.addEventListener("scroll", onScroll, { passive: true });
    const observer = new ResizeObserver(() => recenter());
    observer.observe(track);
    return () => {
      track.removeEventListener("scroll", onScroll);
      observer.disconnect();
      if (rafRef.current !== null) window.cancelAnimationFrame(rafRef.current);
    };
  }, [copyWidth, photos.length, recenter]);

  const scrollByCard = (direction: 1 | -1) => {
    const track = trackRef.current;
    if (!track) return;
    const card = track.querySelector<HTMLElement>("[data-card]");
    const gap = parseFloat(getComputedStyle(track).columnGap || "16") || 16;
    const step = (card?.offsetWidth ?? 270) + gap;
    track.scrollBy({ left: direction * step, behavior: "smooth" });
  };

  if (photos.length === 0) {
    return (
      <p className="mt-10 text-[var(--muted)]">{emptyText || "Фотографии скоро появятся."}</p>
    );
  }

  const canLoop = photos.length > 1;
  const copies = canLoop ? COPIES : 1;

  return (
    <div className="relative mt-10">
      <div
        ref={trackRef}
        className="no-scrollbar -mx-5 flex gap-4 overflow-x-auto px-5 pb-2"
        style={{ scrollSnapType: "x proximity" }}
        aria-label={title ? `Лента фотографий: ${title}` : "Лента фотографий"}
      >
        {Array.from({ length: copies }, (_, copy) =>
          photos.map((photo, index) => (
            <button
              key={`${copy}-${photo.id}`}
              type="button"
              data-card
              onClick={() => setActive(index)}
              tabIndex={copy === Math.floor(copies / 2) ? 0 : -1}
              aria-hidden={copy !== Math.floor(copies / 2)}
              className="group relative h-[300px] w-[220px] shrink-0 snap-start overflow-hidden rounded-[1.25rem] border border-[var(--pink-line)] bg-white text-left transition duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow)] sm:h-[360px] sm:w-[270px]"
              aria-label={photo.caption || `${title || "Фото"} ${index + 1}`}
            >
              <img
                src={photo.url}
                alt={photo.caption || title || "Фотография"}
                loading="lazy"
                draggable={false}
                className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
              />
              {photo.caption ? (
                <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-4 pb-3 pt-8 text-sm text-white">
                  {photo.caption}
                </span>
              ) : null}
            </button>
          )),
        )}
      </div>

      {canLoop ? (
        <>
          <div className="pointer-events-none absolute inset-y-0 -left-5 w-16 bg-gradient-to-r from-white to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 -right-5 w-16 bg-gradient-to-l from-white to-transparent" />
          <button
            type="button"
            onClick={() => scrollByCard(-1)}
            aria-label="Прокрутить влево"
            className="absolute left-0 top-1/2 inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-[var(--pink-deep)] bg-white text-2xl leading-none text-[var(--green)] shadow-[var(--shadow-soft)] transition hover:bg-[var(--pink)] sm:-translate-x-1/2"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={() => scrollByCard(1)}
            aria-label="Прокрутить вправо"
            className="absolute right-0 top-1/2 inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-[var(--pink-deep)] bg-white text-2xl leading-none text-[var(--green)] shadow-[var(--shadow-soft)] transition hover:bg-[var(--pink)] sm:translate-x-1/2"
          >
            ›
          </button>
        </>
      ) : null}

      {active !== null ? (
        <Lightbox
          photos={photos}
          index={active}
          title={title}
          onClose={() => setActive(null)}
          onChange={setActive}
        />
      ) : null}
    </div>
  );
}
