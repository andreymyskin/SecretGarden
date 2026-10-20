import { NextResponse } from "next/server";
import { handleError, requireAdmin } from "@/lib/api";
import { createPriceCard } from "@/lib/content";

/** Adds a price card: `{ title, price, description: TextPart[] }`. */
export async function POST(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const body = (await request.json().catch(() => null)) as {
      title?: unknown;
      price?: unknown;
      description?: unknown;
    } | null;
    const card = await createPriceCard(body ?? {});
    return NextResponse.json({ card });
  } catch (error) {
    return handleError(error);
  }
}
