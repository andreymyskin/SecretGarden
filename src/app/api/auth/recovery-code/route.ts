import { NextResponse } from "next/server";
import { handleError, requireAdmin } from "@/lib/api";
import { createRecoveryCode, getAuthStatus } from "@/lib/auth";

/** Issues a new one-time recovery code. The plain code is returned once and never stored. */
export async function POST(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const body = (await request.json().catch(() => null)) as { password?: unknown } | null;
    const password = typeof body?.password === "string" ? body.password : "";
    const code = await createRecoveryCode(password);
    return NextResponse.json({ code, status: await getAuthStatus() });
  } catch (error) {
    return handleError(error);
  }
}
