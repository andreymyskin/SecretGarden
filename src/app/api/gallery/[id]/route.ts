import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import {
  deleteGalleryItem,
  getGalleryItem,
  saveUploadedImage,
  updateGalleryItem,
} from "@/lib/gallery";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const item = await getGalleryItem(id);
  if (!item) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ item });
}

export async function PUT(request: Request, context: RouteContext) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const existing = await getGalleryItem(id);
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const formData = await request.formData();
  const title = String(formData.get("title") || existing.title).trim();
  const description = String(
    formData.get("description") || existing.description,
  ).trim();
  const file = formData.get("image");

  let imageUrl = existing.imageUrl;
  if (file instanceof File && file.size > 0) {
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Файл должен быть изображением" },
        { status: 400 },
      );
    }
    if (file.size > 8 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Максимальный размер файла — 8 МБ" },
        { status: 400 },
      );
    }
    imageUrl = await saveUploadedImage(file);
  }

  const item = await updateGalleryItem(id, { title, description, imageUrl });
  return NextResponse.json({ item });
}

export async function DELETE(_request: Request, context: RouteContext) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const deleted = await deleteGalleryItem(id);
  if (!deleted) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
