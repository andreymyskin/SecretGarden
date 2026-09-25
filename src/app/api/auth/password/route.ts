import { NextResponse } from "next/server";
import { handleError, requireAdmin } from "@/lib/api";
import { changePassword, createSessionToken, getAuthStatus, sessionCookieOptions } from "@/lib/auth";

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;
  return NextResponse.json(await getAuthStatus(), { headers: { "Cache-Control": "no-store" } });
}

/** Changes the admin password; re-issues the session cookie so the current admin stays signed in. */
export async function POST(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const body = (await request.json().catch(() => null)) as {
      currentPassword?: unknown;
      newPassword?: unknown;
    } | null;
    const currentPassword = typeof body?.currentPassword === "string" ? body.currentPassword : "";
    const status = await changePassword(currentPassword, body?.newPassword);
    const token = await createSessionToken();
    const response = NextResponse.json({ ok: true, status });
    response.cookies.set(sessionCookieOptions(token));
    return response;
  } catch (error) {
    return handleError(error);
  }
}
