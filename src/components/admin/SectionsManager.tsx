"use client";

import { useState } from "react";
import { sectionLabels } from "@/content/site";
import {
  ORDERABLE_SECTIONS,
  isToggleableSection,
  type OrderableSection,
  type SectionVisibility,
  type ToggleableSection,
} from "@/lib/types";
import { adminApi } from "./api";

type Props = {
  sections: SectionVisibility;
  order: OrderableSection[];
  onChanged: () => Promise<void>;
  onError: (message: string) => void;
  onMessage: (message: string) => void;
};

const hints: Record<OrderableSection, string> = {
  studio: "Лента фотографий «Атмосфера, в которой оживает история». Шапка с логотипом и списком преимуществ показывается всегда.",
  projects: "Карточки фотопроектов с галереями.",
  zones: "Карточки локаций с галереями. При скрытии кнопка «Смотреть локации» в шапке заменяется на «Стоимость».",
  wardrobe: "Галерея платьев в аренду.",
  equipment: "Список оборудования с фото и описаниями.",
  light: "Галерея системы освещения.",
  price: "Стоимость услуг и дополнительных опций. Показывается всегда, но может стоять в любом месте страницы.",
};

export function SectionsManager({ sections, order, onChanged, onError, onMessage }: Props) {
  const [busy, setBusy] = useState(false);

  async function run(action: () => Promise<unknown>, success: string) {
    setBusy(true);
    onError("");
    try {
      await action();
      await onChanged();
      onMessage(success);
    } catch (err) {
      onError(err instanceof Error ? err.message : "Не удалось сохранить");
    } finally {
      setBusy(false);
    }
  }

  function toggle(section: ToggleableSection, visible: boolean) {
    return run(
      () => adminApi.setSectionVisibility(section, visible),
      visible ? `Раздел «${sectionLabels[section]}» опубликован` : `Раздел «${sectionLabels[section]}» скрыт с сайта`,
    );
  }

  function move(index: number, direction: "up" | "down") {
    const to = direction === "up" ? index - 1 : index + 1;
    if (to < 0 || to >= order.length) return;
    const next = [...order];
    const [section] = next.splice(index, 1);
    next.splice(to, 0, section);
    return run(
      () => adminApi.setSectionOrder(next),
      `Раздел «${sectionLabels[section]}» перемещён ${direction === "up" ? "выше" : "ниже"}`,
    );
  }

  function resetOrder() {
    return run(() => adminApi.setSectionOrder([...ORDERABLE_SECTIONS]), "Порядок разделов сброшен к исходному");
  }

  const isDefaultOrder = order.every((section, index) => section === ORDERABLE_SECTIONS[index]);

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <h3 className="m-0 font-[family-name:var(--font-display)] text-2xl text-[var(--green)]">
          Порядок и публикация разделов
        </h3>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Разделы идут на сайте и в меню сверху вниз в том порядке, что и в этом списке — стрелками ↑ ↓ его можно
          изменить. Скрытый раздел не показывается на сайте и исчезает из меню, а его фотографии и описания
          сохраняются — раздел можно вернуть в любой момент. Разделы «Стоимость», «Правила» и «Контакты»
          показываются всегда; «Правила» и «Контакты» закрывают страницу и не переставляются.
        </p>
        {!isDefaultOrder ? (
          <button type="button" className="btn btn-ghost btn-sm mt-4" disabled={busy} onClick={resetOrder}>
            Вернуть исходный порядок
          </button>
        ) : null}
      </div>

      <ol className="m-0 grid list-none gap-3 p-0">
        {order.map((section, index) => {
          const toggleable = isToggleableSection(section);
          const visible = toggleable ? sections[section] : true;
          const inputId = `section-${section}`;
          return (
            <li key={section} className="card flex flex-wrap items-center gap-4 p-4 sm:p-5">
              <div className="flex shrink-0 flex-col gap-1">
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  aria-label={`Переместить «${sectionLabels[section]}» выше`}
                  disabled={busy || index === 0}
                  onClick={() => move(index, "up")}
                >
                  ↑
                </button>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  aria-label={`Переместить «${sectionLabels[section]}» ниже`}
                  disabled={busy || index === order.length - 1}
                  onClick={() => move(index, "down")}
                >
                  ↓
                </button>
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold tabular-nums text-[var(--rose)]">{index + 1}.</span>
                  {toggleable ? (
                    <label
                      htmlFor={inputId}
                      className="m-0 cursor-pointer font-[family-name:var(--font-display)] text-xl text-[var(--green)]"
                    >
                      {sectionLabels[section]}
                    </label>
                  ) : (
                    <span className="font-[family-name:var(--font-display)] text-xl text-[var(--green)]">
                      {sectionLabels[section]}
                    </span>
                  )}
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      visible ? "bg-[#e8f1ea] text-[var(--green)]" : "bg-[#fbeeee] text-[#9f5859]"
                    }`}
                  >
                    {visible ? (toggleable ? "Опубликован" : "Всегда на сайте") : "Скрыт"}
                  </span>
                </div>
                <p className="mt-1 text-sm text-[var(--muted)]">{hints[section]}</p>
              </div>

              {toggleable ? (
                <label
                  htmlFor={inputId}
                  className="inline-flex cursor-pointer items-center gap-3 text-sm font-medium text-[var(--ink)]"
                >
                  <span className="hidden sm:inline">{visible ? "Показывать" : "Не показывать"}</span>
                  <span className="relative inline-flex">
                    <input
                      id={inputId}
                      type="checkbox"
                      role="switch"
                      className="peer sr-only"
                      checked={visible}
                      disabled={busy}
                      aria-checked={visible}
                      onChange={(event) => toggle(section, event.target.checked)}
                    />
                    <span className="h-7 w-12 rounded-full border border-[var(--pink-deep)] bg-[var(--pink)] transition-colors peer-checked:border-[var(--green)] peer-checked:bg-[var(--green)] peer-disabled:opacity-60" />
                    <span className="pointer-events-none absolute left-1 top-1 h-5 w-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
                  </span>
                </label>
              ) : null}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
