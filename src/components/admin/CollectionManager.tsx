"use client";

import { FormEvent, useState } from "react";
import type { CollectionItem, CollectionKind } from "@/lib/types";
import { adminApi } from "./api";
import { PhotoManager } from "./PhotoManager";

export type CollectionLabels = {
  newTitle: string;
  addButton: string;
  created: string;
  updated: string;
  deleted: string;
  confirmDelete: (title: string) => string;
  emptyText: string;
  titlePlaceholder: string;
};

type Props = {
  kind: CollectionKind;
  items: CollectionItem[];
  labels: CollectionLabels;
  onChanged: () => Promise<void>;
  onError: (message: string) => void;
  onMessage: (message: string) => void;
};

export function CollectionManager({ kind, items, labels, onChanged, onError, onMessage }: Props) {
  const [busy, setBusy] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [cover, setCover] = useState<File | null>(null);

  const editing = items.find((item) => item.id === editingId) ?? null;

  function resetForm() {
    setEditingId(null);
    setTitle("");
    setDescription("");
    setCover(null);
  }

  function startEdit(item: CollectionItem) {
    setEditingId(item.id);
    setTitle(item.title);
    setDescription(item.description);
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

  function move(item: CollectionItem, direction: "up" | "down") {
    const body = new FormData();
    body.set("move", direction);
    return run(() => adminApi.updateCollectionItem(kind, item.id, body));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const body = new FormData();
    body.set("title", title);
    body.set("description", description);
    if (cover) body.set("cover", cover);
    const ok = await run(
      () =>
        editing
          ? adminApi.updateCollectionItem(kind, editing.id, body)
          : adminApi.createCollectionItem(kind, body),
      editing ? labels.updated : labels.created,
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
          {editing ? `Редактирование: ${editing.title}` : labels.newTitle}
        </h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="field md:col-span-2">
            <label htmlFor={`${kind}-title`}>Название</label>
            <input
              id={`${kind}-title`}
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              required
              placeholder={labels.titlePlaceholder}
            />
          </div>
          <div className="field md:col-span-2">
            <label htmlFor={`${kind}-description`}>Описание</label>
            <textarea
              id={`${kind}-description`}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Коротко, 1–2 предложения"
            />
          </div>
          <div className="field md:col-span-2">
            <label htmlFor={`${kind}-cover`}>{editing ? "Новая обложка (необязательно)" : "Обложка"}</label>
            <input
              id={`${kind}-cover`}
              type="file"
              accept="image/*"
              required={!editing}
              onChange={(event) => setCover(event.target.files?.[0] ?? null)}
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <button type="submit" className="btn" disabled={busy}>
            {busy ? "Сохраняем…" : editing ? "Сохранить" : labels.addButton}
          </button>
          {editing ? (
            <button type="button" className="btn btn-ghost" onClick={resetForm} disabled={busy}>
              Отменить
            </button>
          ) : null}
        </div>
      </form>

      {items.length === 0 ? (
        <p className="text-[var(--muted)]">{labels.emptyText}</p>
      ) : (
        <ul className="m-0 grid list-none gap-4 p-0">
          {items.map((item, index) => (
            <li key={item.id} className="card overflow-hidden">
              <div className="grid gap-4 p-4 sm:grid-cols-[140px_1fr_auto]">
                <img src={item.cover} alt={item.title} className="h-32 w-full rounded-[1rem] object-cover sm:h-full" />
                <div>
                  <h4 className="m-0 font-[family-name:var(--font-display)] text-xl text-[var(--green)]">
                    {index + 1}. {item.title}
                  </h4>
                  <p className="mt-1 text-sm text-[var(--muted)]">{item.description || "Без описания"}</p>
                  <p className="mt-2 text-xs text-[var(--muted)]">Фото в галерее: {item.photos.length}</p>
                </div>
                <div className="flex flex-wrap gap-2 sm:flex-col">
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => startEdit(item)} disabled={busy}>
                    Изменить
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                  >
                    {expandedId === item.id ? "Скрыть фото" : "Галерея"}
                  </button>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      aria-label="Выше"
                      disabled={busy || index === 0}
                      onClick={() => move(item, "up")}
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      aria-label="Ниже"
                      disabled={busy || index === items.length - 1}
                      onClick={() => move(item, "down")}
                    >
                      ↓
                    </button>
                  </div>
                  <button
                    type="button"
                    className="btn btn-danger btn-sm"
                    disabled={busy}
                    onClick={() => {
                      if (!window.confirm(labels.confirmDelete(item.title))) return;
                      run(() => adminApi.deleteCollectionItem(kind, item.id), labels.deleted);
                    }}
                  >
                    Удалить
                  </button>
                </div>
              </div>
              {expandedId === item.id ? (
                <div className="border-t border-[var(--pink-line)] bg-[var(--bg-soft)] p-4">
                  <PhotoManager
                    target={{ kind: "collection", collection: kind, itemId: item.id }}
                    photos={item.photos}
                    title={`Галерея «${item.title}»`}
                    hint="Эти фото открываются по кнопке «Галерея» на карточке."
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
