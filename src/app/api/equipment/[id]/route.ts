import { NextResponse } from "next/server";
import {
  fileOrNull,
  handleError,
  moveOrUndefined,
  requireAdmin,
  stringOrUndefined,
} from "@/lib/api";
import { deleteEquipment, updateEquipment } from "@/lib/content";

type RouteContext = { params: Promise<{ id: string }> };

export async function PUT(request: Request, context: RouteContext) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await context.params;
  try {
    const formData = await request.formData();
    const item = await updateEquipment(id, {
      title: stringOrUndefined(formData.get("title")),
      description: stringOrUndefined(formData.get("description")),
      image: fileOrNull(formData.get("image")),
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

  const { id } = await context.params;
  try {
    await deleteEquipment(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleError(error);
  }
}
