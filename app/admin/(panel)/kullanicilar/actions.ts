"use server";

import { randomInt } from "node:crypto";
import { revalidatePath } from "next/cache";
import { audit } from "@/lib/audit";
import { errorState, parseForm, type ActionState } from "@/lib/actions";
import { guard } from "@/lib/auth/guards";
import { hashPassword, passwordPolicyError } from "@/lib/auth/password";
import { destroyUserSessions } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { createUserSchema, updateUserSchema } from "@/lib/validation/admin";

const PERM = "user:manage" as const;

export type TempPasswordState = ActionState & { tempPassword?: string; email?: string };

function generatePassword(): string {
  const alphabet = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789-_!";
  for (;;) {
    const pw = Array.from({ length: 20 }, () => alphabet[randomInt(alphabet.length)]).join("");
    if (/[a-z]/.test(pw) && /[A-Z]/.test(pw) && /\d/.test(pw) && !passwordPolicyError(pw)) return pw;
  }
}

/** En az bir etkin yönetici (ADMIN) her zaman kalmalıdır. */
async function otherActiveAdmins(excludeId: string): Promise<number> {
  return db.user.count({ where: { role: "ADMIN", active: true, id: { not: excludeId } } });
}

export async function createUserAction(_prev: TempPasswordState, formData: FormData): Promise<TempPasswordState> {
  const g = await guard(PERM);
  if (!g.ok) return g.state;
  const parsed = parseForm(createUserSchema, formData);
  if (!parsed.ok) return parsed.state;
  const d = parsed.data;

  if (await db.user.findUnique({ where: { email: d.email }, select: { id: true } })) {
    return { status: "error", message: "Bu e-posta ile bir kullanıcı zaten var.", fieldErrors: { email: "Bu e-posta ile bir kullanıcı zaten var." } };
  }
  const tempPassword = generatePassword();
  const user = await db.user.create({ data: { email: d.email, name: d.name, role: d.role, passwordHash: await hashPassword(tempPassword), mustChangePassword: true } });
  await audit({ user: g.user, action: "user.created", entity: "User", entityId: user.id, meta: { email: d.email, role: d.role } });
  revalidatePath("/admin/kullanicilar");
  return { status: "success", message: "Kullanıcı oluşturuldu.", tempPassword, email: d.email };
}

export async function updateUserAction(id: string, _prev: ActionState, formData: FormData): Promise<ActionState> {
  const g = await guard(PERM);
  if (!g.ok) return g.state;
  const parsed = parseForm(updateUserSchema, formData);
  if (!parsed.ok) return parsed.state;
  const d = parsed.data;

  const target = await db.user.findUnique({ where: { id } });
  if (!target) return errorState("Kullanıcı bulunamadı.");
  const losesAdmin = target.role === "ADMIN" && target.active && (d.role !== "ADMIN" || !d.active);
  if (losesAdmin && (await otherActiveAdmins(id)) === 0) return errorState("Sistemde en az bir etkin yönetici kalmalıdır.");
  if (id === g.user.id && (!d.active || d.role !== g.user.role)) return errorState("Kendi hesabınızın rolünü değiştiremez veya kendinizi pasife alamazsınız.");

  await db.user.update({ where: { id }, data: { name: d.name, role: d.role, active: d.active } });
  if (!d.active) await destroyUserSessions(id);
  await audit({ user: g.user, action: d.active ? "user.updated" : "user.deactivated", entity: "User", entityId: id, meta: { email: target.email, role: d.role } });
  revalidatePath("/admin/kullanicilar");
  return { status: "success", message: "Kullanıcı güncellendi." };
}

export async function resetUserPasswordAction(id: string, _prev: TempPasswordState): Promise<TempPasswordState> {
  const g = await guard(PERM);
  if (!g.ok) return g.state;
  const target = await db.user.findUnique({ where: { id } });
  if (!target) return errorState("Kullanıcı bulunamadı.");
  const tempPassword = generatePassword();
  await db.user.update({ where: { id }, data: { passwordHash: await hashPassword(tempPassword), mustChangePassword: true, failedLogins: 0, lockedUntil: null, passwordChangedAt: new Date() } });
  await destroyUserSessions(id);
  await audit({ user: g.user, action: "password.changed", entity: "User", entityId: id, meta: { by: "admin-reset", email: target.email } });
  revalidatePath("/admin/kullanicilar");
  return { status: "success", message: "Yeni geçici parola oluşturuldu.", tempPassword, email: target.email };
}

export async function resetUserTwoFactorAction(formData: FormData): Promise<void> {
  const g = await guard(PERM);
  if (!g.ok) return;
  const id = String(formData.get("id") ?? "");
  const target = await db.user.findUnique({ where: { id }, select: { email: true } });
  if (!target) return;
  await db.user.update({ where: { id }, data: { totpEnabled: false, totpSecret: null, totpLastStep: null, recoveryCodes: [] } });
  await audit({ user: g.user, action: "2fa.disabled", entity: "User", entityId: id, meta: { by: "admin-reset", email: target.email } });
  revalidatePath("/admin/kullanicilar");
}
