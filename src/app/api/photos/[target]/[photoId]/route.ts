import { NextResponse } from "next/server";
import { handleError, moveOrUndefined, requireAdmin } from "@/lib/api";
import { removePhoto, updatePhoto } from "@/lib/content";
import { parsePhotoTarget } from "@/lib/types";

type RouteContext = { params: Promise<{ target: string; photoId: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { target: segment, photoId } = await context.params;
  const target = parsePhotoTarget(segment);
  if (!target) {
    return NextResponse.json({ error: "Неизвестный раздел" }, { status: 404 });
  }

  try {
    const body = (await request.json().catch(() => ({}))) as {
      caption?: unknown;
      move?: unknown;
    };
    const photo = await updatePhoto(target, photoId, {
      caption: typeof body.caption === "string" ? body.caption : undefined,
      move: moveOrUndefined(body.move),
    });
    return NextResponse.json({ photo });
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { target: segment, photoId } = await context.params;
  const target = parsePhotoTarget(segment);
  if (!target) {
    return NextResponse.json({ error: "Неизвестный раздел" }, { status: 404 });
  }

  try {
    await removePhoto(target, photoId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleError(error);
  }
}
