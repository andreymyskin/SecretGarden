import { NextResponse } from "next/server";
import {
  fileOrNull,
  handleError,
  moveOrUndefined,
  requireAdmin,
  stringOrUndefined,
} from "@/lib/api";
import { deleteZone, updateZone } from "@/lib/content";

type RouteContext = { params: Promise<{ id: string }> };

export async function PUT(request: Request, context: RouteContext) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await context.params;
  try {
    const formData = await request.formData();
    const zone = await updateZone(id, {
      title: stringOrUndefined(formData.get("title")),
      description: stringOrUndefined(formData.get("description")),
      cover: fileOrNull(formData.get("cover")),
      move: moveOrUndefined(formData.get("move")),
    });
    return NextResponse.json({ zone });
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await context.params;
  try {
    await deleteZone(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleError(error);
  }
}
