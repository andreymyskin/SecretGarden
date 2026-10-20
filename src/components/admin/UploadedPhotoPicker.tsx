"use client";

import { useMemo, useState } from "react";
import type { LibraryImage } from "@/lib/content";
import { adminApi } from "./api";

type Props = {
  /** Gallery uploads can take several photos; a cover or equipment photo takes one. */
  multiple?: boolean;
  disabled?: boolean;
  selectedUrl?: string | null;
  onPick: (urls: string[]) => void;
};

export function UploadedPhotoPicker({ multiple = false, disabled = false, selectedUrl, onPick }: Props) {
  const [open, setOpen] = useState(false);
  const [images, setImages] = useState<LibraryImage[] | null>(null);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("Все");
  const [picked, setPicked] = useState<string[]>([]);

  const filters = useMemo(() => {
    const names = new Set<string>();
    for (const image of images ?? []) {
      for (const place of image.places) names.add(place.split(":")[0].trim());
    }
    return ["Все", ...names];
  }, [images]);

  const visible = (images ?? []).filter((image) => {
    if (filter === "Все") return true;
    return image.places.some((place) => place === filter || place.startsWith(`${filter}:`));
  });

  async function toggle() {
    const next = !open;
    setOpen(next);
    setPicked([]);
    setError("");
    if (next) {
      try {
        const data = await adminApi.library();
        setImages(data.images);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Не удалось загрузить список фотографий");
      }
    }
  }

  function choose(url: string) {
    if (!multiple) {
      onPick([url]);
      setOpen(false);
      return;
    }
    setPicked((current) => (current.includes(url) ? current.filter((item) => item !== url) : [...current, url]));
  }

  return (
    <div className="space-y-3">
      <button type="button" className="btn btn-ghost" disabled={disabled} onClick={toggle}>
        {open ? "Скрыть загруженные" : "Выбрать из загруженных"}
      </button>
      {selectedUrl ? (
        <img src={selectedUrl} alt="Выбранная фотография" className="h-24 w-36 rounded-[0.8rem] object-cover" />
      ) : null}
      {open ? (
        <div className="rounded-[1rem] border border-[var(--pink-line)] bg-white p-4">
          <p className="m-0 text-sm text-[var(--muted)]">
            Это фотографии, которые уже есть на сайте. Файл заново не загружается, а если удалить снимок в одном
            разделе, в остальных он останется.
          </p>
          {error ? <p className="mt-3 text-sm text-[#9f5859]">{error}</p> : null}
          {images === null && !error ? <p className="mt-3 text-sm text-[var(--muted)]">Загружаем…</p> : null}
          {images && images.length === 0 ? (
            <p className="mt-3 text-sm text-[var(--muted)]">На сервере пока нет фотографий.</p>
          ) : null}
          {images && images.length > 0 ? (
            <>
              <div className="field mt-3 max-w-xs">
                <label htmlFor="library-filter">Раздел</label>
                <select id="library-filter" value={filter} onChange={(event) => setFilter(event.target.value)}>
                  {filters.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>
              <ul className="m-0 mt-4 grid max-h-80 list-none grid-cols-3 gap-2 overflow-y-auto p-0 sm:grid-cols-4 lg:grid-cols-6">
                {visible.map((image) => {
                  const active = picked.includes(image.url) || selectedUrl === image.url;
                  return (
                    <li key={image.url}>
                      <button
                        type="button"
                        className={`block w-full overflow-hidden rounded-[0.7rem] border text-left ${
                          active ? "border-[var(--green)] ring-2 ring-[var(--green)]" : "border-[var(--pink-line)]"
                        }`}
                        aria-pressed={active}
                        title={image.places.join(", ")}
                        onClick={() => choose(image.url)}
                      >
                        <img src={image.url} alt={image.caption || image.places[0]} className="aspect-square w-full object-cover" />
                      </button>
                    </li>
                  );
                })}
              </ul>
              {visible.length === 0 ? <p className="mt-3 text-sm text-[var(--muted)]">В этом разделе фотографий нет.</p> : null}
              {multiple ? (
                <button
                  type="button"
                  className="btn mt-4"
                  disabled={disabled || picked.length === 0}
                  onClick={() => {
                    onPick(picked);
                    setPicked([]);
                    setOpen(false);
                  }}
                >
                  Добавить выбранные{picked.length ? ` (${picked.length})` : ""}
                </button>
              ) : null}
            </>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
