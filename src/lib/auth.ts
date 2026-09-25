import { createHmac, randomBytes, randomInt, scryptSync, timingSafeEqual } from "crypto";
import { promises as fs } from "fs";
import { cookies } from "next/headers";
import path from "path";
import { ContentError } from "./content";

const COOKIE_NAME = "sg_admin_session";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7;
const AUTH_FILE = path.join(process.cwd(), "data", "auth.json");

export const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MAX_LENGTH = 128;

/* ---------- credential store ---------- */

type AuthStore = {
  /** `scrypt:<salt>:<hash>`; absent while the password still comes from ADMIN_PASSWORD. */
  passwordHash?: string;
  recoveryCodeHash?: string;
  /** Bumped on every password change so older sessions stop being valid. */
  version: number;
  updatedAt?: string;
  passwordChangedAt?: string;
};

const defaultStore = (): AuthStore => ({ version: 0 });

async function readStore(): Promise<AuthStore> {
  try {
    const raw = await fs.readFile(AUTH_FILE, "utf8");
    const parsed = JSON.parse(raw) as Partial<AuthStore>;
    return {
      passwordHash: typeof parsed.passwordHash === "string" ? parsed.passwordHash : undefined,
      recoveryCodeHash: typeof parsed.recoveryCodeHash === "string" ? parsed.recoveryCodeHash : undefined,
      version: typeof parsed.version === "number" ? parsed.version : 0,
      updatedAt: typeof parsed.updatedAt === "string" ? parsed.updatedAt : undefined,
      passwordChangedAt: typeof parsed.passwordChangedAt === "string" ? parsed.passwordChangedAt : undefined,
    };
  } catch {
    return defaultStore();
  }
}

let writeQueue: Promise<unknown> = Promise.resolve();

function mutateStore<T>(fn: (store: AuthStore) => T): Promise<T> {
  const run = async () => {
    const store = await readStore();
    const result = fn(store);
    store.updatedAt = new Date().toISOString();
    await fs.mkdir(path.dirname(AUTH_FILE), { recursive: true });
    await fs.writeFile(AUTH_FILE, JSON.stringify(store, null, 2), "utf8");
    return result;
  };
  const next = writeQueue.then(run, run);
  writeQueue = next.catch(() => undefined);
  return next;
}

function hashSecret(secret: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(secret.normalize("NFKC"), salt, 64).toString("hex");
  return `scrypt:${salt}:${hash}`;
}

function verifySecret(secret: string, stored: string | undefined): boolean {
  if (!stored) return false;
  const [scheme, salt, hash] = stored.split(":");
  if (scheme !== "scrypt" || !salt || !hash) return false;
  const candidate = scryptSync(secret.normalize("NFKC"), salt, 64);
  const expected = Buffer.from(hash, "hex");
  return candidate.length === expected.length && timingSafeEqual(candidate, expected);
}

function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

function getEnvPassword() {
  return process.env.ADMIN_PASSWORD || "secretgarden";
}

function getSecret() {
  return process.env.ADMIN_SECRET || "secret-garden-dev-secret";
}

/* ---------- password & recovery ---------- */

export type AuthStatus = {
  /** True once the password was changed in the admin panel (stored hashed in data/auth.json). */
  customPassword: boolean;
  hasRecoveryCode: boolean;
  passwordChangedAt: string | null;
};

export async function getAuthStatus(): Promise<AuthStatus> {
  const store = await readStore();
  return {
    customPassword: Boolean(store.passwordHash),
    hasRecoveryCode: Boolean(store.recoveryCodeHash),
    passwordChangedAt: store.passwordChangedAt ?? null,
  };
}

export async function verifyPassword(password: string): Promise<boolean> {
  if (typeof password !== "string" || !password) return false;
  const store = await readStore();
  if (store.passwordHash) return verifySecret(password, store.passwordHash);
  return safeEqual(password, getEnvPassword());
}

function validateNewPassword(password: unknown): asserts password is string {
  if (typeof password !== "string" || password.trim().length === 0) {
    throw new ContentError("Введите новый пароль");
  }
  if (password.length < PASSWORD_MIN_LENGTH) {
    throw new ContentError(`Пароль должен быть не короче ${PASSWORD_MIN_LENGTH} символов`);
  }
  if (password.length > PASSWORD_MAX_LENGTH) {
    throw new ContentError("Слишком длинный пароль");
  }
  if (password !== password.trim()) {
    throw new ContentError("Пароль не должен начинаться или заканчиваться пробелом");
  }
}

export async function changePassword(currentPassword: string, newPassword: unknown): Promise<AuthStatus> {
  if (!(await verifyPassword(currentPassword))) {
    throw new ContentError("Текущий пароль указан неверно", 403);
  }
  validateNewPassword(newPassword);
  if (newPassword === currentPassword) {
    throw new ContentError("Новый пароль совпадает с текущим");
  }
  const hash = hashSecret(newPassword);
  await mutateStore((store) => {
    store.passwordHash = hash;
    store.passwordChangedAt = new Date().toISOString();
    store.version += 1;
  });
  return getAuthStatus();
}

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function generateRecoveryCode(): string {
  const groups: string[] = [];
  for (let g = 0; g < 4; g += 1) {
    let group = "";
    for (let i = 0; i < 4; i += 1) group += CODE_ALPHABET[randomInt(CODE_ALPHABET.length)];
    groups.push(group);
  }
  return groups.join("-");
}

function normalizeRecoveryCode(code: unknown): string {
  if (typeof code !== "string") return "";
  return code.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

/** Issues a fresh one-time recovery code (shown to the admin once) and stores only its hash. */
export async function createRecoveryCode(password: string): Promise<string> {
  if (!(await verifyPassword(password))) {
    throw new ContentError("Пароль указан неверно", 403);
  }
  const code = generateRecoveryCode();
  const hash = hashSecret(normalizeRecoveryCode(code));
  await mutateStore((store) => {
    store.recoveryCodeHash = hash;
  });
  return code;
}

export async function resetPasswordWithRecoveryCode(code: unknown, newPassword: unknown): Promise<void> {
  const store = await readStore();
  if (!store.recoveryCodeHash) {
    throw new ContentError("Код восстановления не создан. Сбросить пароль можно только через сервер", 403);
  }
  const normalized = normalizeRecoveryCode(code);
  if (!normalized || !verifySecret(normalized, store.recoveryCodeHash)) {
    throw new ContentError("Неверный код восстановления", 403);
  }
  validateNewPassword(newPassword);
  const hash = hashSecret(newPassword);
  await mutateStore((current) => {
    current.passwordHash = hash;
    current.passwordChangedAt = new Date().toISOString();
    current.recoveryCodeHash = undefined;
    current.version += 1;
  });
}

/* ---------- brute-force throttling ---------- */

const WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILURES = 8;
const failures = new Map<string, { count: number; since: number }>();

export function clientKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "local";
  return ip;
}

export function assertNotThrottled(key: string) {
  const entry = failures.get(key);
  if (!entry) return;
  if (Date.now() - entry.since > WINDOW_MS) {
    failures.delete(key);
    return;
  }
  if (entry.count >= MAX_FAILURES) {
    throw new ContentError("Слишком много неудачных попыток. Попробуйте через 15 минут", 429);
  }
}

export function registerFailure(key: string) {
  const entry = failures.get(key);
  if (!entry || Date.now() - entry.since > WINDOW_MS) {
    failures.set(key, { count: 1, since: Date.now() });
  } else {
    entry.count += 1;
  }
}

export function clearFailures(key: string) {
  failures.delete(key);
}

/* ---------- sessions ---------- */

function sign(payload: string) {
  return createHmac("sha256", getSecret()).update(payload).digest("hex");
}

export async function createSessionToken() {
  const store = await readStore();
  const payload = `admin:${Date.now()}:${store.version}`;
  return `${payload}.${sign(payload)}`;
}

export async function verifySessionToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return false;
  if (!safeEqual(signature, sign(payload))) return false;

  const [, issuedAtRaw, versionRaw = "0"] = payload.split(":");
  const issuedAt = Number(issuedAtRaw);
  if (!Number.isFinite(issuedAt) || Date.now() - issuedAt >= MAX_AGE_SECONDS * 1000) return false;

  const store = await readStore();
  return Number(versionRaw) === store.version;
}

export async function isAuthenticated() {
  const cookieStore = await cookies();
  return verifySessionToken(cookieStore.get(COOKIE_NAME)?.value);
}

export function sessionCookieOptions(token: string) {
  return {
    name: COOKIE_NAME,
    value: token,
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  };
}

export function clearSessionCookieOptions() {
  return {
    name: COOKIE_NAME,
    value: "",
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  };
}
