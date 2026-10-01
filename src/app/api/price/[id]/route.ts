import { NextResponse } from "next/server";
import { handleError, moveOrUndefined, requireAdmin } from "@/lib/api";
import { deletePriceCard, updatePriceCard } from "@/lib/content";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await context.params;
  try {
    const body = (await request.json().catch(() => null)) as {
      title?: unknown;
      price?: unknown;
      description?: unknown;
      move?: unknown;
    } | null;
    const card = await updatePriceCard(id, {
      title: body?.title,
      price: body?.price,
      description: body?.description,
      move: moveOrUndefined(body?.move),
    });
    return NextResponse.json({ card });
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await context.params;
  try {
    await deletePriceCard(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleError(error);
  }
}
