import type { TextPart } from "./types";

const MAX_TEXT_LENGTH = 2000;

/** Turns stored or submitted text into merged runs of plain and bold fragments. */
export function normalizeParts(value: unknown): TextPart[] {
  const raw: TextPart[] = [];
  if (typeof value === "string") {
    raw.push({ text: value, bold: false });
  } else if (Array.isArray(value)) {
    for (const entry of value) {
      if (typeof entry === "string") {
        raw.push({ text: entry, bold: false });
      } else if (entry && typeof entry === "object" && typeof (entry as TextPart).text === "string") {
        raw.push({ text: (entry as TextPart).text, bold: (entry as TextPart).bold === true });
      }
    }
  }
  const merged: TextPart[] = [];
  for (const part of raw) {
    if (!part.text) continue;
    const last = merged[merged.length - 1];
    if (last && last.bold === part.bold) last.text += part.text;
    else merged.push({ text: part.text, bold: part.bold });
  }
  return merged;
}

export function partsToPlain(parts: TextPart[]): string {
  return parts.map((part) => part.text).join("");
}

export const MAX_RICH_TEXT_LENGTH = MAX_TEXT_LENGTH;

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/** HTML for the admin editor. Newlines become <br>, bold runs become <strong>. */
export function partsToHtml(parts: TextPart[]): string {
  return parts
    .map((part) => {
      const html = escapeHtml(part.text).replace(/\n/g, "<br>");
      return part.bold ? `<strong>${html}</strong>` : html;
    })
    .join("");
}

function isBoldElement(element: HTMLElement): boolean {
  const tag = element.tagName;
  if (tag === "STRONG" || tag === "B") return true;
  const weight = element.style.fontWeight;
  return weight === "bold" || weight === "bolder" || Number(weight) >= 600;
}

/** Reads the contenteditable DOM back into text parts. Block tags become line breaks. */
export function partsFromElement(root: HTMLElement): TextPart[] {
  const parts: TextPart[] = [];
  const push = (text: string, bold: boolean) => {
    if (!text) return;
    const last = parts[parts.length - 1];
    if (last && last.bold === bold) last.text += text;
    else parts.push({ text, bold });
  };

  const walk = (node: Node, bold: boolean) => {
    if (node.nodeType === Node.TEXT_NODE) {
      push(node.textContent ?? "", bold);
      return;
    }
    if (!(node instanceof HTMLElement)) return;
    if (node.tagName === "BR") {
      push("\n", false);
      return;
    }
    const block = node.tagName === "DIV" || node.tagName === "P";
    if (block && parts.length > 0 && !parts[parts.length - 1].text.endsWith("\n")) {
      push("\n", false);
    }
    const nextBold = bold || isBoldElement(node);
    node.childNodes.forEach((child) => walk(child, nextBold));
  };

  root.childNodes.forEach((child) => walk(child, false));
  return parts;
}
