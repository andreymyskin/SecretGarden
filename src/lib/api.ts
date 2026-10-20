import { NextResponse } from "next/server";
import { isAuthenticated } from "./auth";
import { ContentError } from "./content";

export async function requireAdmin(): Promise<NextResponse | null> {
  if (await isAuthenticated()) return null;
  return NextResponse.json({ error: "Требуется вход в админ-панель" }, { status: 401 });
}

export function handleError(error: unknown): NextResponse {
  if (error instanceof ContentError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }
  console.error(error);
  return NextResponse.json({ error: "Внутренняя ошибка сервера" }, { status: 500 });
}

export function fileOrNull(value: FormDataEntryValue | null): File | null {
  return value instanceof File && value.size > 0 ? value : null;
}

export function stringOrUndefined(value: FormDataEntryValue | null): string | undefined {
  return typeof value === "string" ? value : undefined;
}

export function moveOrUndefined(value: unknown): "up" | "down" | undefined {
  return value === "up" || value === "down" ? value : undefined;
}
