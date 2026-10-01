"use client";

import { useRef, useState } from "react";
import type { Photo, PhotoTarget } from "@/lib/types";
import { photoTargetSegment } from "@/lib/types";
import { adminApi } from "./api";

type Props = {
  target: PhotoTarget;
  photos: Photo[];
  title: string;
  hint?: string;
  onChanged: () => Promise<void>;
  onError: (message: string) => void;
  onMessage: (message: string) => void;
};

export function PhotoManager({ target, photos, title, hint, onChanged, onError, onMessage }: Props) {
  const [busy, setBusy] = useState(false);
  const [captions, setCaptions] = useState<Record<string, string>>({});
  const inputRef = useRef<HTMLInputElement>(null);

  async function run(action: () => Promise<unknown>, success?: string) {
    setBusy(true);
    onError("");
    try {
      await action();
      await onChanged();
      if (success) onMessage(success);
    } catch (error) {
      onError(error instanceof Error ? error.message : "Ошибка");
    } finally {
      setBusy(false);
    }
  }

  async function handleUpload() {
    const files = Array.from(inputRef.current?.files ?? []);
    if (files.length === 0) {
      onError("Выберите файлы для загрузки");
      return;
    }
    await run(
      () => adminApi.uploadPhotos(target, files),
      files.length === 1 ? "Фото добавлено" : `Добавлено фото: ${files.length}`,
    );
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="card p-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h3 className="m-0 font-[family-name:var(--font-display)] text-2xl text-[var(--green)]">
            {title}
            <span className="ml-2 text-base text-[var(--muted)]">({photos.length})</span>
          </h3>
          {hint ? <p className="mt-1 text-sm text-[var(--muted)]">{hint}</p> : null}
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <div className="field">
            <label htmlFor={`upload-${photoKey(target)}`}>Новые фото (можно несколько)</label>
            <input id={`upload-${photoKey(target)}`} ref={inputRef} type="file" accept="image/*" multiple />
          </div>
          <button type="button" className="btn" onClick={handleUpload} disabled={busy}>
            {busy ? "Сохраняем…" : "Загрузить"}
          </button>
        </div>
      </div>

      {photos.length === 0 ? (
        <p className="mt-6 text-[var(--muted)]">Пока нет фотографий.</p>
      ) : (
        <ul className="m-0 mt-6 grid list-none gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3">
          {photos.map((photo, index) => {
            const caption = captions[photo.id] ?? photo.caption;
            const dirty = caption !== photo.caption;
            return (
              <li key={photo.id} className="overflow-hidden rounded-[1.25rem] border border-[var(--pink-line)] bg-white">
                <div className="relative aspect-[4/3] bg-[var(--pink)]">
                  <img src={photo.url} alt={photo.caption || title} className="h-full w-full object-cover" />
                  <span className="pill absolute left-3 top-3 bg-white/90">{index + 1}</span>
                </div>
                <div className="space-y-3 p-4">
                  <div className="field">
                    <label htmlFor={`caption-${photo.id}`}>Подпись</label>
                    <input
                      id={`caption-${photo.id}`}
                      value={caption}
                      placeholder="Необязательно"
                      onChange={(event) =>
                        setCaptions((prev) => ({ ...prev, [photo.id]: event.target.value }))
                      }
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {dirty ? (
                      <button
                        type="button"
                        className="btn btn-sm"
                        disabled={busy}
                        onClick={() =>
                          run(async () => {
                            await adminApi.updatePhoto(target, photo.id, { caption });
                            setCaptions((prev) => {
                              const next = { ...prev };
                              delete next[photo.id];
                              return next;
                            });
                          }, "Подпись сохранена")
                        }
                      >
                        Сохранить
                      </button>
                    ) : null}
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      disabled={busy || index === 0}
                      aria-label="Переместить выше"
                      onClick={() => run(() => adminApi.updatePhoto(target, photo.id, { move: "up" }))}
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      disabled={busy || index === photos.length - 1}
                      aria-label="Переместить ниже"
                      onClick={() => run(() => adminApi.updatePhoto(target, photo.id, { move: "down" }))}
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      className="btn btn-danger btn-sm ml-auto"
                      disabled={busy}
                      onClick={() => {
                        if (!window.confirm("Удалить это фото?")) return;
                        run(() => adminApi.deletePhoto(target, photo.id), "Фото удалено");
                      }}
                    >
                      Удалить
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function photoKey(target: PhotoTarget) {
  return photoTargetSegment(target);
}
