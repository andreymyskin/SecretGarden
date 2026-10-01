import { NextResponse } from "next/server";
import { handleError, requireAdmin } from "@/lib/api";
import { setHeroPoints } from "@/lib/content";

/** Replaces the hero text list: `{ points: HeroPoint[] }`. */
export async function PUT(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const body = (await request.json().catch(() => null)) as { points?: unknown } | null;
    const points = await setHeroPoints(body?.points);
    return NextResponse.json({ points });
  } catch (error) {
    return handleError(error);
  }
}
