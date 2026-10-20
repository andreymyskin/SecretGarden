import { NextResponse } from "next/server";
import { handleError, requireAdmin } from "@/lib/api";
import { listLibrary } from "@/lib/content";

export const dynamic = "force-dynamic";

/** Photos already stored on the server, so another section can reuse them. */
export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const images = await listLibrary();
    return NextResponse.json({ images }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return handleError(error);
  }
}
