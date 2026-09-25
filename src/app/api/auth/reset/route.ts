import { NextResponse } from "next/server";
import { handleError } from "@/lib/api";
import {
  assertNotThrottled,
  clearFailures,
  clientKey,
  createSessionToken,
  registerFailure,
  resetPasswordWithRecoveryCode,
  sessionCookieOptions,
} from "@/lib/auth";
import { ContentError } from "@/lib/content";

/** Public: sets a new password using the one-time recovery code and signs the admin in. */
export async function POST(request: Request) {
  const key = clientKey(request);
  try {
    assertNotThrottled(key);
    const body = (await request.json().catch(() => null)) as {
      recoveryCode?: unknown;
      newPassword?: unknown;
    } | null;

    try {
      await resetPasswordWithRecoveryCode(body?.recoveryCode, body?.newPassword);
    } catch (error) {
      if (error instanceof ContentError && error.status === 403) registerFailure(key);
      throw error;
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
