"use server";

import { redirect } from "next/navigation";
import { audit } from "@/lib/audit";
import { errorState, formToObject, type ActionState } from "@/lib/actions";
import { attemptLogin, verifySecondFactor } from "@/lib/auth/login";
import { completePasswordReset, requestPasswordReset } from "@/lib/auth/reset";
import { passwordPolicyError } from "@/lib/auth/password";
import { createSession, destroyCurrentSession, getPendingUser } from "@/lib/auth/session";
import { safeNextPath } from "@/lib/auth/constants";
import { db } from "@/lib/db";
import { retryMessage } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/request";

const GENERIC_LOGIN_ERROR = "E-posta veya parola hatalı.";

export async function loginAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const raw = formToObject(formData);
  const email = typeof raw.email === "string" ? raw.email.trim() : "";
  const password = typeof raw.password === "string" ? raw.password : "";
  if (!email || !password || email.length > 200 || password.length > 256) return errorState(GENERIC_LOGIN_ERROR);

  const ip = await getClientIp();
  const result = await attemptLogin(email, password, ip);
  if (!result.ok) {
    return errorState(
      result.reason === "rate" ? `Çok fazla giriş denemesi yapıldı. ${retryMessage(result.retryAfterSeconds ?? 900)}` : GENERIC_LOGIN_ERROR,
    );
  }

  if (result.needs2fa) {
    await createSession(result.userId, { twoFactorPending: true });
    redirect(`/admin/login/dogrulama?next=${encodeURIComponent(safeNextPath(raw.next))}`);
  }

  await createSession(result.userId);
  const user = await db.user.findUniqueOrThrow({ where: { id: result.userId }, select: { id: true, email: true } });
  await audit({ user, action: "login.success" });
  redirect(safeNextPath(raw.next));
}

export async function verifyTwoFactorAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const raw = formToObject(formData);
  const pending = await getPendingUser();
  if (!pending) redirect("/admin/login");

  const code = typeof raw.code === "string" ? raw.code.trim().slice(0, 32) : "";
  if (!code) return errorState("Lütfen doğrulama kodunu girin.");

  const result = await verifySecondFactor(pending.id, code);
  if (!result.ok) {
    return errorState(
      result.reason === "rate" ? `Çok fazla deneme yapıldı. ${retryMessage(result.retryAfterSeconds ?? 900)}` : "Kod geçersiz veya süresi dolmuş. Lütfen tekrar deneyin.",
    );
  }

  // Oturum sabitleme (fixation) koruması: bekleyen oturum silinir, YENİ tam yetkili oturum üretilir.
  await destroyCurrentSession();
  await createSession(pending.id);
  await audit({ user: pending, action: "login.success", meta: { twoFactor: true, recoveryCode: result.usedRecoveryCode } });
  redirect(safeNextPath(raw.next));
}

export async function cancelTwoFactorAction(): Promise<void> {
  await destroyCurrentSession();
  redirect("/admin/login");
}

export async function requestResetAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const raw = formToObject(formData);
  const email = typeof raw.email === "string" ? raw.email.trim() : "";
  if (email && email.length <= 200) await requestPasswordReset(email, await getClientIp());
  // E-posta kayıtlı olsun olmasın aynı yanıt (kullanıcı varlığı sızmaz).
  return {
    status: "success",
    message: "E-posta adresi kayıtlıysa, parola sıfırlama bağlantısı gönderilmiştir. Bağlantı 30 dakika geçerlidir.",
  };
}

export async function completeResetAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const raw = formToObject(formData);
  const token = typeof raw.token === "string" ? raw.token : "";
  const password = typeof raw.password === "string" ? raw.password : "";
  const confirm = typeof raw.confirm === "string" ? raw.confirm : "";
  if (password !== confirm) return { status: "error", message: "Parolalar eşleşmiyor.", fieldErrors: { confirm: "Parolalar eşleşmiyor." } };
  const policy = passwordPolicyError(password);
  if (policy) return { status: "error", message: policy, fieldErrors: { password: policy } };

  const result = await completePasswordReset(token, password);
  if (!result.ok) return errorState(result.message);
  redirect("/admin/login?sifirlandi=1");
}
