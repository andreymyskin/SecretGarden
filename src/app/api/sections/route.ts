import { NextResponse } from "next/server";
import { handleError, requireAdmin } from "@/lib/api";
import { ContentError, setSectionVisibility } from "@/lib/content";
import { isToggleableSection } from "@/lib/types";

export async function PATCH(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const body = (await request.json().catch(() => null)) as {
      section?: unknown;
      visible?: unknown;
    } | null;
    if (typeof body?.section !== "string" || !isToggleableSection(body.section)) {
      throw new ContentError("Неизвестный раздел", 404);
    }
    if (typeof body.visible !== "boolean") {
      throw new ContentError("Укажите, показывать ли раздел");
    }
    const sections = await setSectionVisibility(body.section, body.visible);
    return NextResponse.json({ sections });
  } catch (error) {
    return handleError(error);
  }
}
