"use client";

import { FormEvent, useState } from "react";
import type { Zone } from "@/lib/types";
import { adminApi } from "./api";
import { PhotoManager } from "./PhotoManager";

type Props = {
  zones: Zone[];
  onChanged: () => Promise<void>;
  onError: (message: string) => void;
  onMessage: (message: string) => void;
};

export function ZonesManager({ zones, onChanged, onError, onMessage }: Props) {
  const [busy, setBusy] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [cover, setCover] = useState<File | null>(null);

  const editing = zones.find((zone) => zone.id === editingId) ?? null;

  function resetForm() {
    setEditingId(null);
    setTitle("");
    setDescription("");
    setCover(null);
  }

  function startEdit(zone: Zone) {
    setEditingId(zone.id);
    setTitle(zone.title);
    setDescription(zone.description);
    setCover(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function run(action: () => Promise<unknown>, success?: string) {
    setBusy(true);
    onError("");
    try {
      await action();
      await onChanged();
      if (success) onMessage(success);
      return true;
    } catch (error) {
      onError(error instanceof Error ? error.message : "Ошибка");
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const body = new FormData();
    body.set("title", title);
    body.set("description", description);
    if (cover) body.set("cover", cover);
    const ok = await run(
      () => (editing ? adminApi.updateZone(editing.id, body) : adminApi.createZone(body)),
      editing ? "Зона обновлена" : "Зона добавлена",
    );
    if (ok) {
      resetForm();
      (event.target as HTMLFormElement).reset();
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="card space-y-4 p-6">
        <h3 className="m-0 font-[family-name:var(--font-display)] text-2xl text-[var(--green)]">
          {editing ? `Редактирование: ${editing.title}` : "Новая зона"}
        </h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="field md:col-span-2">
            <label htmlFor="zone-title">Название</label>
            <input
              id="zone-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              required
              placeholder="Например, Старинный рояль"
            />
          </div>
          <div className="field md:col-span-2">
            <label htmlFor="zone-description">Описание</label>
            <textarea
              id="zone-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Коротко о зоне"
            />
          </div>
          <div className="field md:col-span-2">
            <label htmlFor="zone-cover">{editing ? "Новая обложка (необязательно)" : "Обложка"}</label>
            <input
              id="zone-cover"
              type="file"
              accept="image/*"
              required={!editing}
              onChange={(event) => setCover(event.target.files?.[0] ?? null)}
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <button type="submit" className="btn" disabled={busy}>
            {busy ? "Сохраняем…" : editing ? "Сохранить" : "Добавить зону"}
          </button>
          {editing ? (
            <button type="button" className="btn btn-ghost" onClick={resetForm} disabled={busy}>
              Отменить
            </button>
          ) : null}
        </div>
      </form>

      {zones.length === 0 ? (
        <p className="text-[var(--muted)]">Зон пока нет.</p>
      ) : (
        <ul className="m-0 grid list-none gap-4 p-0">
          {zones.map((zone, index) => (
            <li key={zone.id} className="card overflow-hidden">
              <div className="grid gap-4 p-4 sm:grid-cols-[140px_1fr_auto]">
                <img src={zone.cover} alt={zone.title} className="h-32 w-full rounded-[1rem] object-cover sm:h-full" />
                <div>
                  <h4 className="m-0 font-[family-name:var(--font-display)] text-xl text-[var(--green)]">
                    {index + 1}. {zone.title}
                  </h4>
                  <p className="mt-1 text-sm text-[var(--muted)]">{zone.description || "Без описания"}</p>
                  <p className="mt-2 text-xs text-[var(--muted)]">Фото в галерее: {zone.photos.length}</p>
                </div>
                <div className="flex flex-wrap gap-2 sm:flex-col">
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => startEdit(zone)} disabled={busy}>
                    Изменить
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => setExpandedId(expandedId === zone.id ? null : zone.id)}
                  >
                    {expandedId === zone.id ? "Скрыть фото" : "Фото зоны"}
                  </button>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      aria-label="Выше"
                      disabled={busy || index === 0}
                      onClick={() => {
                        const body = new FormData();
                        body.set("move", "up");
                        run(() => adminApi.updateZone(zone.id, body));
                      }}
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      aria-label="Ниже"
                      disabled={busy || index === zones.length - 1}
                      onClick={() => {
                        const body = new FormData();
                        body.set("move", "down");
                        run(() => adminApi.updateZone(zone.id, body));
                      }}
                    >
                      ↓
                    </button>
                  </div>
                  <button
                    type="button"
                    className="btn btn-danger btn-sm"
                    disabled={busy}
                    onClick={() => {
                      if (!window.confirm(`Удалить зону «${zone.title}» вместе с её фотографиями?`)) return;
                      run(() => adminApi.deleteZone(zone.id), "Зона удалена");
                    }}
                  >
                    Удалить
                  </button>
                </div>
              </div>
              {expandedId === zone.id ? (
                <div className="border-t border-[var(--pink-line)] bg-[var(--bg-soft)] p-4">
                  <PhotoManager
                    target={{ kind: "zone", zoneId: zone.id }}
                    photos={zone.photos}
                    title={`Галерея «${zone.title}»`}
                    hint="Эти фото открываются по кнопке «Галерея» на карточке зоны."
                    onChanged={onChanged}
                    onError={onError}
                    onMessage={onMessage}
                  />
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
