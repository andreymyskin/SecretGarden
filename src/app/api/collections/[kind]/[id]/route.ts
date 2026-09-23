import { NextResponse } from "next/server";
import {
  fileOrNull,
  handleError,
  moveOrUndefined,
  requireAdmin,
  stringOrUndefined,
} from "@/lib/api";
import { deleteCollectionItem, updateCollectionItem } from "@/lib/content";
import { isCollectionKind } from "@/lib/types";

type RouteContext = { params: Promise<{ kind: string; id: string }> };

export async function PUT(request: Request, context: RouteContext) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { kind, id } = await context.params;
  if (!isCollectionKind(kind)) {
    return NextResponse.json({ error: "Неизвестный раздел" }, { status: 404 });
  }

  try {
    const formData = await request.formData();
    const item = await updateCollectionItem(kind, id, {
      title: stringOrUndefined(formData.get("title")),
      description: stringOrUndefined(formData.get("description")),
      cover: fileOrNull(formData.get("cover")),
      move: moveOrUndefined(formData.get("move")),
    });
    return NextResponse.json({ item });
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { kind, id } = await context.params;
  if (!isCollectionKind(kind)) {
    return NextResponse.json({ error: "Неизвестный раздел" }, { status: 404 });
  }

  try {
    await deleteCollectionItem(kind, id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleError(error);
  }
}
