"use client";

import { FormEvent, useState } from "react";
import { RichText } from "@/components/RichText";
import { partsToPlain } from "@/lib/rich-text";
import type { PriceCard, TextPart } from "@/lib/types";
import { adminApi } from "./api";
import { RichTextField } from "./RichTextField";

type Props = {
  cards: PriceCard[];
  onChanged: () => Promise<void>;
  onError: (message: string) => void;
  onMessage: (message: string) => void;
};

const emptyParts: TextPart[] = [];

export function PriceManager({ cards, onChanged, onError, onMessage }: Props) {
  const [busy, setBusy] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState<TextPart[]>(emptyParts);
  const [editorKey, setEditorKey] = useState("new");

  const editing = cards.find((card) => card.id === editingId) ?? null;

  function resetForm() {
    setEditingId(null);
    setTitle("");
    setPrice("");
    setDescription(emptyParts);
    setEditorKey(`new-${crypto.randomUUID()}`);
  }

  function startEdit(card: PriceCard) {
    setEditingId(card.id);
    setTitle(card.title);
    setPrice(card.price);
    setDescription(card.description.map((part) => ({ ...part })));
    setEditorKey(card.id);
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
    const body = { title, price, description };
    const ok = await run(
      () => (editing ? adminApi.updatePriceCard(editing.id, body) : adminApi.createPriceCard(body)),
      editing ? "Карточка обновлена" : "Карточка добавлена",
    );
    if (ok) resetForm();
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="card space-y-4 p-6">
        <h3 className="m-0 font-[family-name:var(--font-display)] text-2xl text-[var(--green)]">
          {editing ? `Редактирование: ${editing.title}` : "Новая карточка стоимости"}
        </h3>
        <p className="m-0 text-sm text-[var(--muted)]">
          Заголовок и стоимость показываются в шапке карточки. В описании можно выделить фрагмент и нажать «Жирный».
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="field">
            <label htmlFor="price-title">Заголовок</label>
            <input
              id="price-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              required
              maxLength={160}
              placeholder="Например, Фотопроект под ключ"
            />
          </div>
          <div className="field">
            <label htmlFor="price-value">Стоимость</label>
            <input
              id="price-value"
              value={price}
              onChange={(event) => setPrice(event.target.value)}
              required
              maxLength={40}
              placeholder="Например, 5500 ₽"
            />
          </div>
          <div className="md:col-span-2">
            <RichTextField
              id="price-description"
              label="Описание"
              hint="Выделите слова и нажмите «Жирный», чтобы выделить их на сайте."
              placeholder="Что входит в стоимость"
              value={description}
              resetKey={editorKey}
              onChange={setDescription}
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <button type="submit" className="btn" disabled={busy}>
            {busy ? "Сохраняем…" : editing ? "Сохранить" : "Добавить карточку"}
          </button>
          {editing ? (
            <button type="button" className="btn btn-ghost" onClick={resetForm} disabled={busy}>
              Отменить
            </button>
          ) : null}
        </div>
      </form>

      {cards.length === 0 ? <p className="text-[var(--muted)]">Карточек пока нет.</p> : null}

      <ul className="m-0 grid list-none gap-4 p-0">
        {cards.map((card, index) => (
          <li key={card.id} className="card flex flex-wrap items-start justify-between gap-4 p-5">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <h3 className="m-0 font-[family-name:var(--font-display)] text-xl text-[var(--green)]">{card.title}</h3>
                <p className="m-0 font-[family-name:var(--font-display)] text-xl text-[var(--rose)]">{card.price}</p>
              </div>
              {partsToPlain(card.description).trim() ? (
                <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-[var(--muted)]">
                  <RichText parts={card.description} />
                </p>
              ) : null}
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" className="btn btn-ghost btn-sm" aria-label="Выше" disabled={busy || index === 0} onClick={() => run(() => adminApi.updatePriceCard(card.id, { move: "up" }))}>
                ↑
              </button>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                aria-label="Ниже"
                disabled={busy || index === cards.length - 1}
                onClick={() => run(() => adminApi.updatePriceCard(card.id, { move: "down" }))}
              >
                ↓
              </button>
              <button type="button" className="btn btn-ghost btn-sm" disabled={busy} onClick={() => startEdit(card)}>
                Изменить
              </button>
              <button
                type="button"
                className="btn btn-danger btn-sm"
                disabled={busy}
                onClick={() => {
                  if (!window.confirm(`Удалить карточку «${card.title}»?`)) return;
                  run(() => adminApi.deletePriceCard(card.id), "Карточка удалена");
                }}
              >
                Удалить
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
