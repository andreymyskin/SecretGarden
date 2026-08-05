import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import {
  createGalleryItem,
  getGalleryItems,
  saveUploadedImage,
} from "@/lib/gallery";

export async function GET() {
  const items = await getGalleryItems();
  return NextResponse.json({ items });
}

export async function POST(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const file = formData.get("image");

  if (!title) {
    return NextResponse.json(
      { error: "Укажите название работы" },
      { status: 400 },
    );
  }

  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json(
      { error: "Загрузите изображение" },
      { status: 400 },
    );
  }

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

  const imageUrl = await saveUploadedImage(file);
  const item = await createGalleryItem({ title, description, imageUrl });
  return NextResponse.json({ item }, { status: 201 });
}
