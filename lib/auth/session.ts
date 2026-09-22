import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import type { Role } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import { env } from "@/lib/env";
import { getClientIp, getUserAgent } from "@/lib/request";
import { randomToken, sha256 } from "@/lib/auth/crypto";
import {
  SESSION_ABSOLUTE_MS,
  SESSION_IDLE_MS,
  SESSION_PENDING_MS,
  SESSION_REFRESH_AFTER_MS,
  sessionCookieName,
} from "@/lib/auth/constants";

/**
 * Sunucu tarafı oturumlar.
 *  - Çerezde yalnızca 256 bit rastgele token; veritabanında SHA-256 özeti tutulur (DB sızsa bile oturum çalınamaz).
 *  - httpOnly, SameSite=Lax, https'te Secure + __Host- öneki.
 *  - 8 saat hareketsizlik, en fazla 7 gün mutlak süre. Parola değişiminde tüm oturumlar düşer.
 *  - 2FA açık hesaplarda parola sonrası "beklemede" oturum verilir; kod doğrulanınca YENİ oturum üretilir (session fixation koruması).
 */
export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: Role;
  totpEnabled: boolean;
  mustChangePassword: boolean;
  sessionId: string;
};

const cookieName = () => sessionCookieName(env.secureCookies);

export async function createSession(userId: string, opts: { twoFactorPending?: boolean } = {}): Promise<void> {
  const token = randomToken(32);
  const now = Date.now();
  const pending = Boolean(opts.twoFactorPending);
  const expiresAt = new Date(now + (pending ? SESSION_PENDING_MS : SESSION_IDLE_MS));
  const absoluteExpiresAt = new Date(now + (pending ? SESSION_PENDING_MS : SESSION_ABSOLUTE_MS));

  const ip = await getClientIp();
  await db.session.create({
    data: {
      id: sha256(token),
      userId,
      twoFactorPending: pending,
      ip: ip === "unknown" ? null : ip,
      userAgent: await getUserAgent(),
      expiresAt,
      absoluteExpiresAt,
    },
  });

  const jar = await cookies();
  jar.set(cookieName(), token, {
    httpOnly: true,
    secure: env.secureCookies,
    sameSite: "lax",
    path: "/",
    expires: absoluteExpiresAt,
  });
}

const getSessionRecord = cache(async () => {
  const jar = await cookies();
  const token = jar.get(cookieName())?.value;
  if (!token || token.length > 256) return null;

  const id = sha256(token);
  const session = await db.session.findUnique({ where: { id }, include: { user: true } });
  if (!session) return null;

  const now = new Date();
  if (session.expiresAt <= now || session.absoluteExpiresAt <= now || !session.user.active) {
    await db.session.delete({ where: { id } }).catch(() => {});
    return null;
  }

  // Kayan süre: sık sık yazmamak için yalnızca yeterince eskidiyse uzat.
  if (!session.twoFactorPending && session.expiresAt.getTime() - now.getTime() < SESSION_IDLE_MS - SESSION_REFRESH_AFTER_MS) {
    const next = new Date(Math.min(now.getTime() + SESSION_IDLE_MS, session.absoluteExpiresAt.getTime()));
    await db.session.update({ where: { id }, data: { lastSeenAt: now, expiresAt: next } }).catch(() => {});
  }
  return session;
});

function toSessionUser(session: NonNullable<Awaited<ReturnType<typeof getSessionRecord>>>): SessionUser {
  const u = session.user;
  return {
    id: u.id,
    email: u.email,
    name: u.name,
    role: u.role,
    totpEnabled: u.totpEnabled,
    mustChangePassword: u.mustChangePassword,
    sessionId: session.id,
  };
}

/** Tam yetkili (2FA tamamlanmış) oturumun kullanıcısı; yoksa null. */
export const getCurrentUser = cache(async (): Promise<SessionUser | null> => {
  const session = await getSessionRecord();
  if (!session || session.twoFactorPending) return null;
  return toSessionUser(session);
});

/** Parolası doğrulanmış ama 2FA kodu bekleyen kullanıcı. */
export const getPendingUser = cache(async (): Promise<SessionUser | null> => {
  const session = await getSessionRecord();
  if (!session || !session.twoFactorPending) return null;
  return toSessionUser(session);
});

export async function clearSessionCookie(): Promise<void> {
  const jar = await cookies();
  // __Host- çerezi silmek için de Secure özniteliği gerekir; delete() bunu göndermez.
  jar.set(cookieName(), "", { httpOnly: true, secure: env.secureCookies, sameSite: "lax", path: "/", maxAge: 0 });
}

export async function destroyCurrentSession(): Promise<void> {
  const jar = await cookies();
  const token = jar.get(cookieName())?.value;
  if (token) await db.session.deleteMany({ where: { id: sha256(token) } });
  await clearSessionCookie();
}

/** Kullanıcının tüm oturumlarını (isteğe bağlı olarak biri hariç) sonlandırır. */
export async function destroyUserSessions(userId: string, exceptSessionId?: string): Promise<void> {
  await db.session.deleteMany({
    where: { userId, ...(exceptSessionId ? { id: { not: exceptSessionId } } : {}) },
  });
}
