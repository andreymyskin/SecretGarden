import { NextResponse } from "next/server";
import { fileOrNull, handleError, requireAdmin } from "@/lib/api";

function stringOrEmpty(value: FormDataEntryValue | null): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}
import { createEquipment } from "@/lib/content";

export async function POST(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const formData = await request.formData();
    const item = await createEquipment({
      title: String(formData.get("title") ?? ""),
      description: String(formData.get("description") ?? ""),
      image: fileOrNull(formData.get("image")),
      existingImage: stringOrEmpty(formData.get("existingImage")),
    });
    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}
