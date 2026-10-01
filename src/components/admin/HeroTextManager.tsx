"use client";

import { useState } from "react";
import { STRENGTH_ICONS, type HeroPoint, type StrengthIcon, type TextPart } from "@/lib/types";
import { adminApi } from "./api";
import { RichTextField } from "./RichTextField";

type Props = {
  points: HeroPoint[];
  onChanged: () => Promise<void>;
  onError: (message: string) => void;
  onMessage: (message: string) => void;
};

const iconLabels: Record<StrengthIcon, string> = {
  camera: "Камера",
  building: "Здание",
  piano: "Рояль",
  map: "Метка на карте",
  dress: "Гардероб",
  price: "Цена",
};

function clonePoints(points: HeroPoint[]): HeroPoint[] {
  return points.map((point) => ({ ...point, parts: point.parts.map((part) => ({ ...part })) }));
}

export function HeroTextManager({ points, onChanged, onError, onMessage }: Props) {
  const [draft, setDraft] = useState<HeroPoint[]>(() => clonePoints(points));
  const [busy, setBusy] = useState(false);

  function update(id: string, patch: Partial<Pick<HeroPoint, "icon" | "parts">>) {
    setDraft((current) => current.map((point) => (point.id === id ? { ...point, ...patch } : point)));
  }

  function move(index: number, direction: "up" | "down") {
    const to = direction === "up" ? index - 1 : index + 1;
    if (to < 0 || to >= draft.length) return;
    setDraft((current) => {
      const next = [...current];
      const [item] = next.splice(index, 1);
      next.splice(to, 0, item);
      return next;
    });
  }

  function addPoint() {
    const id = `new-${crypto.randomUUID()}`;
    setDraft((current) => [
      ...current,
      { id, icon: "camera", parts: [{ text: "", bold: false }] },
    ]);
  }

  function remove(id: string) {
    setDraft((current) => current.filter((point) => point.id !== id));
  }

  async function save() {
    setBusy(true);
    onError("");
    try {
      await adminApi.setHeroPoints(draft);
      await onChanged();
      onMessage("Текст шапки сохранён");
    } catch (error) {
      onError(error instanceof Error ? error.message : "Не удалось сохранить");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="card p-6">
        <h3 className="m-0 font-[family-name:var(--font-display)] text-2xl text-[var(--green)]">Текст шапки</h3>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Пункты под заголовком «Тайный Сад». Чтобы выделить фрагмент жирным, выделите его мышью и нажмите «Жирный»
          (или Ctrl+B). Переносы строк сохраняются.
        </p>
      </div>

      {draft.length === 0 ? <p className="text-[var(--muted)]">Пунктов пока нет — добавьте первый.</p> : null}

      <ol className="m-0 grid list-none gap-4 p-0">
        {draft.map((point, index) => (
          <li key={point.id} className="card space-y-4 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="m-0 text-sm font-semibold text-[var(--rose)]">Пункт {index + 1}</p>
              <div className="flex flex-wrap gap-2">
                <button type="button" className="btn btn-ghost btn-sm" aria-label="Выше" disabled={busy || index === 0} onClick={() => move(index, "up")}>
                  ↑
                </button>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  aria-label="Ниже"
                  disabled={busy || index === draft.length - 1}
                  onClick={() => move(index, "down")}
                >
                  ↓
                </button>
                <button type="button" className="btn btn-danger btn-sm" disabled={busy} onClick={() => remove(point.id)}>
                  Удалить
                </button>
              </div>
            </div>
            <div className="field max-w-xs">
              <label htmlFor={`hero-icon-${point.id}`}>Иконка</label>
              <select
                id={`hero-icon-${point.id}`}
                value={point.icon}
                onChange={(event) => update(point.id, { icon: event.target.value as StrengthIcon })}
              >
                {STRENGTH_ICONS.map((icon) => (
                  <option key={icon} value={icon}>
                    {iconLabels[icon]}
                  </option>
                ))}
              </select>
            </div>
            <RichTextField
              id={`hero-text-${point.id}`}
              label="Текст пункта"
              hint="Выделите слова и нажмите «Жирный»."
              placeholder="Текст пункта"
              value={point.parts}
              resetKey={point.id}
              onChange={(parts: TextPart[]) => update(point.id, { parts })}
            />
          </li>
        ))}
      </ol>

      <div className="flex flex-wrap gap-3">
        <button type="button" className="btn btn-ghost" disabled={busy || draft.length >= 12} onClick={addPoint}>
          Добавить пункт
        </button>
        <button type="button" className="btn" disabled={busy} onClick={save}>
          {busy ? "Сохраняем…" : "Сохранить текст шапки"}
        </button>
      </div>
    </div>
  );
}
