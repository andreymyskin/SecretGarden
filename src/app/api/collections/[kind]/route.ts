import { NextResponse } from "next/server";
import { fileOrNull, handleError, requireAdmin } from "@/lib/api";

function stringOrEmpty(value: FormDataEntryValue | null): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}
import { createCollectionItem } from "@/lib/content";
import { isCollectionKind } from "@/lib/types";

type RouteContext = { params: Promise<{ kind: string }> };

export async function POST(request: Request, context: RouteContext) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { kind } = await context.params;
  if (!isCollectionKind(kind)) {
    return NextResponse.json({ error: "Неизвестный раздел" }, { status: 404 });
  }

  try {
    const formData = await request.formData();
    const item = await createCollectionItem(kind, {
      title: String(formData.get("title") ?? ""),
      description: String(formData.get("description") ?? ""),
      cover: fileOrNull(formData.get("cover")),
      existingCover: stringOrEmpty(formData.get("existingCover")),
    });
    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}
