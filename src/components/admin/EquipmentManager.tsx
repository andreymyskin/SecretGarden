"use client";

import { FormEvent, useState } from "react";
import type { EquipmentItem } from "@/lib/types";
import { adminApi } from "./api";

type Props = {
  items: EquipmentItem[];
  onChanged: () => Promise<void>;
  onError: (message: string) => void;
  onMessage: (message: string) => void;
};

export function EquipmentManager({ items, onChanged, onError, onMessage }: Props) {
  const [busy, setBusy] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<File | null>(null);

  const editing = items.find((item) => item.id === editingId) ?? null;

  function resetForm() {
    setEditingId(null);
    setTitle("");
    setDescription("");
    setImage(null);
  }

  function startEdit(item: EquipmentItem) {
    setEditingId(item.id);
    setTitle(item.title);
    setDescription(item.description);
    setImage(null);
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
    if (image) body.set("image", image);
    const ok = await run(
      () => (editing ? adminApi.updateEquipment(editing.id, body) : adminApi.createEquipment(body)),
      editing ? "Позиция обновлена" : "Позиция добавлена",
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
          {editing ? `Редактирование: ${editing.title}` : "Новая позиция оборудования"}
        </h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="field md:col-span-2">
            <label htmlFor="eq-title">Название</label>
            <input
              id="eq-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              required
              placeholder="Например, Осветитель Godox SL100BI"
            />
          </div>
          <div className="field md:col-span-2">
            <label htmlFor="eq-description">Описание</label>
            <textarea
              id="eq-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Характеристики и для чего используется"
            />
          </div>
          <div className="field md:col-span-2">
            <label htmlFor="eq-image">{editing ? "Новое фото (необязательно)" : "Фото"}</label>
            <input
              id="eq-image"
              type="file"
              accept="image/*"
              required={!editing}
              onChange={(event) => setImage(event.target.files?.[0] ?? null)}
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <button type="submit" className="btn" disabled={busy}>
            {busy ? "Сохраняем…" : editing ? "Сохранить" : "Добавить"}
          </button>
          {editing ? (
            <button type="button" className="btn btn-ghost" onClick={resetForm} disabled={busy}>
              Отменить
            </button>
          ) : null}
        </div>
      </form>

      {items.length === 0 ? (
        <p className="text-[var(--muted)]">Оборудование пока не добавлено.</p>
      ) : (
        <ul className="m-0 grid list-none gap-4 p-0">
          {items.map((item, index) => (
            <li key={item.id} className="card grid gap-4 p-4 sm:grid-cols-[140px_1fr_auto]">
              <img src={item.image} alt={item.title} className="h-32 w-full rounded-[1rem] object-cover sm:h-full" />
              <div>
                <h4 className="m-0 font-[family-name:var(--font-display)] text-xl text-[var(--green)]">
                  {index + 1}. {item.title}
                </h4>
                <p className="mt-1 text-sm text-[var(--muted)]">{item.description || "Без описания"}</p>
              </div>
              <div className="flex flex-wrap gap-2 sm:flex-col">
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => startEdit(item)} disabled={busy}>
                  Изменить
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
                      run(() => adminApi.updateEquipment(item.id, body));
                    }}
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    aria-label="Ниже"
                    disabled={busy || index === items.length - 1}
                    onClick={() => {
                      const body = new FormData();
                      body.set("move", "down");
                      run(() => adminApi.updateEquipment(item.id, body));
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
                    if (!window.confirm(`Удалить «${item.title}»?`)) return;
                    run(() => adminApi.deleteEquipment(item.id), "Позиция удалена");
                  }}
                >
                  Удалить
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
