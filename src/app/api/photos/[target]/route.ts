import { NextResponse } from "next/server";
import { handleError, requireAdmin } from "@/lib/api";
import { addExistingPhotos, addPhotos } from "@/lib/content";
import { parsePhotoTarget } from "@/lib/types";

type RouteContext = { params: Promise<{ target: string }> };

export async function POST(request: Request, context: RouteContext) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { target: segment } = await context.params;
  const target = parsePhotoTarget(segment);
  if (!target) {
    return NextResponse.json({ error: "Неизвестный раздел" }, { status: 404 });
  }

  try {
    const contentType = request.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      const body = (await request.json().catch(() => null)) as { urls?: unknown } | null;
      const photos = await addExistingPhotos(target, body?.urls);
      return NextResponse.json({ photos }, { status: 201 });
    }
    const formData = await request.formData();
    const files = formData
      .getAll("images")
      .filter((entry): entry is File => entry instanceof File && entry.size > 0);
    const photos = await addPhotos(target, files);
    return NextResponse.json({ photos }, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}
