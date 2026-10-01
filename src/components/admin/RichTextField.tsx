"use client";

import { useEffect, useRef } from "react";
import { partsFromElement, partsToHtml } from "@/lib/rich-text";
import type { TextPart } from "@/lib/types";

type Props = {
  id: string;
  label: string;
  hint?: string;
  placeholder?: string;
  value: TextPart[];
  /** Remounts the editor contents when the edited record changes. */
  resetKey: string;
  onChange: (parts: TextPart[]) => void;
};

/** Plain text field with a button that bolds the current selection. */
export function RichTextField({ id, label, hint, placeholder, value, resetKey, onChange }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) ref.current.innerHTML = partsToHtml(value);
    // The editor owns its DOM after this snapshot; later keystrokes must not reset the caret.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey]);

  function publish() {
    if (!ref.current) return;
    onChange(partsFromElement(ref.current));
  }

  function applyBold() {
    ref.current?.focus();
    document.execCommand("bold");
    publish();
  }

  return (
    <div className="field">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label htmlFor={id}>{label}</label>
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          aria-label="Сделать выделенный фрагмент жирным"
          onMouseDown={(event) => event.preventDefault()}
          onClick={applyBold}
        >
          Жирный
        </button>
      </div>
      {hint ? <p className="m-0 text-xs leading-relaxed text-[var(--muted)]">{hint}</p> : null}
      <div
        id={id}
        ref={ref}
        role="textbox"
        aria-multiline="true"
        contentEditable
        suppressContentEditableWarning
        data-placeholder={placeholder}
        className="rich-editor"
        onInput={publish}
        onPaste={(event) => {
          event.preventDefault();
          const text = event.clipboardData.getData("text/plain");
          document.execCommand("insertText", false, text);
          publish();
        }}
      />
    </div>
  );
}
