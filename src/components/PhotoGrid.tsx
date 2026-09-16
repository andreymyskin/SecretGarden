"use client";

import { useState } from "react";
import type { Photo } from "@/lib/types";
import { Lightbox } from "./Lightbox";

type Props = {
  photos: Photo[];
  title?: string;
  variant?: "masonry" | "grid";
  emptyText?: string;
};

export function PhotoGrid({ photos, title, variant = "masonry", emptyText }: Props) {
  const [active, setActive] = useState<number | null>(null);

  if (photos.length === 0) {
    return (
      <p className="mt-10 text-[var(--muted)]">
        {emptyText || "Фотографии скоро появятся."}
      </p>
    );
  }

  const tile = (photo: Photo, index: number, className: string) => (
    <button
      key={photo.id}
      type="button"
      onClick={() => setActive(index)}
      className={`group relative overflow-hidden rounded-[1.25rem] border border-[var(--pink-line)] bg-white text-left transition duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow)] ${className}`}
      aria-label={photo.caption || `${title || "Фото"} ${index + 1}`}
    >
      <img
        src={photo.url}
        alt={photo.caption || title || "Фотография"}
        loading="lazy"
        className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
      />
      {photo.caption ? (
        <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-4 pb-3 pt-8 text-sm text-white">
          {photo.caption}
        </span>
      ) : null}
    </button>
  );

  return (
    <>
      {variant === "grid" ? (
        <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {photos.map((photo, index) => tile(photo, index, "aspect-[3/4]"))}
        </div>
      ) : (
        <div className="mt-10 columns-2 gap-4 md:columns-3 lg:columns-4">
          {photos.map((photo, index) => tile(photo, index, "mb-4 w-full break-inside-avoid"))}
        </div>
      )}

      {active !== null ? (
        <Lightbox
          photos={photos}
          index={active}
          title={title}
          onClose={() => setActive(null)}
          onChange={setActive}
        />
      ) : null}
    </>
  );
}
