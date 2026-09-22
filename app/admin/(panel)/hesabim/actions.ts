"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { audit } from "@/lib/audit";
import { errorState, parseForm, successState, type ActionState } from "@/lib/actions";
import { guard } from "@/lib/auth/guards";
import { decryptSecret, encryptSecret, sha256 } from "@/lib/auth/crypto";
import { hashPassword, passwordPolicyError, verifyPassword } from "@/lib/auth/password";
import { destroyUserSessions } from "@/lib/auth/session";
import { generateRecoveryCodes, generateTotpSecret, normalizeRecoveryCode, totpStep, verifyTotp } from "@/lib/auth/totp";
import { db } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";
import { rateKey } from "@/lib/request";
import { changePasswordSchema } from "@/lib/validation/admin";

export async function changePasswordAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const g = await guard(undefined, { allowMustChangePassword: true });
  if (!g.ok) return g.state;

  const parsed = parseForm(changePasswordSchema, formData);
  if (!parsed.ok) return parsed.state;

  const limit = await rateLimit(rateKey("change-password", g.user.id), 8, 15 * 60);
  if (!limit.ok) return errorState("Çok fazla deneme yapıldı. Lütfen biraz sonra tekrar deneyin.");

  const user = await db.user.findUnique({ where: { id: g.user.id } });
  if (!user || !(await verifyPassword(parsed.data.current, user.passwordHash))) {
    return { status: "error", message: "Mevcut parola hatalı.", fieldErrors: { current: "Mevcut parola hatalı." } };
  }
  const policy = passwordPolicyError(parsed.data.password, { email: user.email, name: user.name });
  if (policy) return { status: "error", message: policy, fieldErrors: { password: policy } };
  if (parsed.data.password === parsed.data.current) {
    return { status: "error", message: "Yeni parola mevcut parolanızdan farklı olmalıdır.", fieldErrors: { password: "Yeni parola mevcut parolanızdan farklı olmalıdır." } };
  }

  await db.user.update({ where: { id: user.id }, data: { passwordHash: await hashPassword(parsed.data.password), passwordChangedAt: new Date(), mustChangePassword: false } });
  await destroyUserSessions(user.id, g.user.sessionId); // diğer tüm cihazlardaki oturumlar kapanır
  await audit({ user: g.user, action: "password.changed" });
  revalidatePath("/admin", "layout");
  return successState("Parolanız değiştirildi. Diğer cihazlardaki oturumlar kapatıldı.");
}

/** Diğer tüm oturumları sonlandırır. */
export async function signOutOthersAction(): Promise<void> {
  const g = await guard(undefined, { allowMustChangePassword: true });
  if (!g.ok) return;
  await destroyUserSessions(g.user.id, g.user.sessionId);
  revalidatePath("/admin/hesabim");
}

/** 2FA kurulumu: yeni bir (henüz etkin olmayan) sır üretir. */
export async function startTwoFactorSetupAction(): Promise<void> {
  const g = await guard(undefined, { allowMustChangePassword: true });
  if (!g.ok) return;
  if (g.user.totpEnabled) return;
  await db.user.update({ where: { id: g.user.id }, data: { totpSecret: encryptSecret(generateTotpSecret()), totpEnabled: false } });
  revalidatePath("/admin/hesabim");
}

export type EnableTwoFactorState = ActionState & { recoveryCodes?: string[] };

export async function enableTwoFactorAction(_prev: EnableTwoFactorState, formData: FormData): Promise<EnableTwoFactorState> {
  const g = await guard(undefined, { allowMustChangePassword: true });
  if (!g.ok) return g.state;
  const code = String(formData.get("code") ?? "").trim();

  const limit = await rateLimit(rateKey("enable-2fa", g.user.id), 10, 15 * 60);
  if (!limit.ok) return errorState("Çok fazla deneme yapıldı. Lütfen biraz sonra tekrar deneyin.");

  const user = await db.user.findUnique({ where: { id: g.user.id } });
  if (!user?.totpSecret || user.totpEnabled) return errorState("Kurulum başlatılmamış. Sayfayı yenileyip tekrar deneyin.");

  const check = verifyTotp(decryptSecret(user.totpSecret), code);
  if (!check.ok) return { status: "error", message: "Kod doğrulanamadı. Uygulamadaki güncel kodu girdiğinizden emin olun.", fieldErrors: { code: "Kod hatalı veya süresi dolmuş." } };

  const codes = generateRecoveryCodes(8);
  await db.user.update({
    where: { id: user.id },
    data: { totpEnabled: true, totpLastStep: check.step ?? totpStep(), recoveryCodes: codes.map((c) => sha256(normalizeRecoveryCode(c))) },
  });
  await audit({ user: g.user, action: "2fa.enabled" });
  // DİKKAT: burada revalidatePath çağrılmaz — sayfa yenilenirse kurulum formu (ve istemcide tutulan, bir kez gösterilen
  // kurtarma kodları) ekrandan kaybolurdu. Sayfa bir sonraki gezinmede zaten güncel durumu gösterir.
  return { status: "success", message: "İki adımlı doğrulama açıldı.", recoveryCodes: codes };
}

export async function disableTwoFactorAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const g = await guard(undefined, { allowMustChangePassword: true });
  if (!g.ok) return g.state;
  const password = String(formData.get("password") ?? "");

  const limit = await rateLimit(rateKey("disable-2fa", g.user.id), 8, 15 * 60);
  if (!limit.ok) return errorState("Çok fazla deneme yapıldı. Lütfen biraz sonra tekrar deneyin.");
  const user = await db.user.findUnique({ where: { id: g.user.id } });
  if (!user || !(await verifyPassword(password, user.passwordHash))) return { status: "error", message: "Parola hatalı.", fieldErrors: { password: "Parola hatalı." } };

  await db.user.update({ where: { id: user.id }, data: { totpEnabled: false, totpSecret: null, totpLastStep: null, recoveryCodes: [] } });
  await audit({ user: g.user, action: "2fa.disabled" });
  revalidatePath("/admin/hesabim");
  return successState("İki adımlı doğrulama kapatıldı.");
}

export async function regenerateRecoveryCodesAction(_prev: EnableTwoFactorState, formData: FormData): Promise<EnableTwoFactorState> {
  const g = await guard(undefined, { allowMustChangePassword: true });
  if (!g.ok) return g.state;
  const password = String(formData.get("password") ?? "");
  const user = await db.user.findUnique({ where: { id: g.user.id } });
  if (!user?.totpEnabled) return errorState("İki adımlı doğrulama açık değil.");
  if (!(await verifyPassword(password, user.passwordHash))) return { status: "error", message: "Parola hatalı.", fieldErrors: { password: "Parola hatalı." } };

  const codes = generateRecoveryCodes(8);
  await db.user.update({ where: { id: user.id }, data: { recoveryCodes: codes.map((c) => sha256(normalizeRecoveryCode(c))) } });
  await audit({ user: g.user, action: "2fa.enabled", meta: { recoveryCodesRegenerated: true } });
  return { status: "success", message: "Yeni kurtarma kodları oluşturuldu. Eskileri geçersizdir.", recoveryCodes: codes };
}

export async function goToAccountAfterPasswordChange(): Promise<void> {
  redirect("/admin");
}
