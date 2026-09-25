"use client";

import { useState } from "react";
import { sectionLabels } from "@/content/site";
import { TOGGLEABLE_SECTIONS, type SectionVisibility, type ToggleableSection } from "@/lib/types";
import { adminApi } from "./api";

type Props = {
  sections: SectionVisibility;
  onChanged: () => Promise<void>;
  onError: (message: string) => void;
  onMessage: (message: string) => void;
};

const hints: Record<ToggleableSection, string> = {
  studio: "Лента фотографий «Атмосфера, в которой оживает история». Шапка с логотипом и списком преимуществ показывается всегда.",
  projects: "Карточки фотопроектов с галереями.",
  zones: "Карточки локаций с галереями. При скрытии кнопка «Смотреть локации» в шапке заменяется на «Стоимость».",
  wardrobe: "Галерея платьев в аренду.",
  equipment: "Список оборудования с фото и описаниями.",
  light: "Галерея системы освещения.",
};

export function SectionsManager({ sections, onChanged, onError, onMessage }: Props) {
  const [pending, setPending] = useState<ToggleableSection | null>(null);

  async function toggle(section: ToggleableSection, visible: boolean) {
    setPending(section);
    onError("");
    try {
      await adminApi.setSectionVisibility(section, visible);
      await onChanged();
      onMessage(
        visible
          ? `Раздел «${sectionLabels[section]}» опубликован`
          : `Раздел «${sectionLabels[section]}» скрыт с сайта`,
      );
    } catch (err) {
      onError(err instanceof Error ? err.message : "Не удалось сохранить");
    } finally {
      setPending(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <h3 className="m-0 font-[family-name:var(--font-display)] text-2xl text-[var(--green)]">
          Публикация разделов
        </h3>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Скрытый раздел не показывается на сайте и исчезает из меню, а его фотографии и описания сохраняются —
          раздел можно вернуть в любой момент. Разделы «Стоимость», «Правила» и «Контакты» показываются всегда.
        </p>
      </div>

      <ul className="m-0 grid list-none gap-3 p-0">
        {TOGGLEABLE_SECTIONS.map((section) => {
          const visible = sections[section];
          const inputId = `section-${section}`;
          return (
            <li key={section} className="card flex flex-wrap items-center justify-between gap-4 p-4 sm:p-5">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <label htmlFor={inputId} className="m-0 cursor-pointer font-[family-name:var(--font-display)] text-xl text-[var(--green)]">
                    {sectionLabels[section]}
                  </label>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      visible
                        ? "bg-[#e8f1ea] text-[var(--green)]"
                        : "bg-[#fbeeee] text-[#9f5859]"
                    }`}
                  >
                    {visible ? "Опубликован" : "Скрыт"}
                  </span>
                </div>
                <p className="mt-1 text-sm text-[var(--muted)]">{hints[section]}</p>
              </div>
              <label htmlFor={inputId} className="inline-flex cursor-pointer items-center gap-3 text-sm font-medium text-[var(--ink)]">
                <span className="hidden sm:inline">{visible ? "Показывать" : "Не показывать"}</span>
                <span className="relative inline-flex">
                  <input
                    id={inputId}
                    type="checkbox"
                    role="switch"
                    className="peer sr-only"
                    checked={visible}
                    disabled={pending !== null}
                    aria-checked={visible}
                    onChange={(event) => toggle(section, event.target.checked)}
                  />
                  <span className="h-7 w-12 rounded-full border border-[var(--pink-deep)] bg-[var(--pink)] transition-colors peer-checked:border-[var(--green)] peer-checked:bg-[var(--green)] peer-disabled:opacity-60" />
                  <span className="pointer-events-none absolute left-1 top-1 h-5 w-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
                </span>
              </label>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
