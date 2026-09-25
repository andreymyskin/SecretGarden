import { NextResponse } from "next/server";
import { handleError } from "@/lib/api";
import {
  assertNotThrottled,
  clearFailures,
  clientKey,
  createSessionToken,
  registerFailure,
  sessionCookieOptions,
  verifyPassword,
} from "@/lib/auth";

export async function POST(request: Request) {
  const key = clientKey(request);
  try {
    assertNotThrottled(key);
    const body = (await request.json().catch(() => null)) as { password?: unknown } | null;
    const password = typeof body?.password === "string" ? body.password : "";

    if (!(await verifyPassword(password))) {
      registerFailure(key);
      return NextResponse.json({ error: "Неверный пароль" }, { status: 401 });
    }

    clearFailures(key);
    const token = await createSessionToken();
    const response = NextResponse.json({ ok: true });
    response.cookies.set(sessionCookieOptions(token));
    return response;
  } catch (error) {
    return handleError(error);
  }
}
