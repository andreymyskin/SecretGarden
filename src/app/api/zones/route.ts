import { NextResponse } from "next/server";
import { fileOrNull, handleError, requireAdmin } from "@/lib/api";
import { createZone } from "@/lib/content";

export async function POST(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const formData = await request.formData();
    const zone = await createZone({
      title: String(formData.get("title") ?? ""),
      description: String(formData.get("description") ?? ""),
      cover: fileOrNull(formData.get("cover")),
    });
    return NextResponse.json({ zone }, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}
