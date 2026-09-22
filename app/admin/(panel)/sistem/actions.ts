"use server";

import { revalidatePath } from "next/cache";
import { audit } from "@/lib/audit";
import { errorState, successState, type ActionState } from "@/lib/actions";
import { guard } from "@/lib/auth/guards";
import { db } from "@/lib/db";
import { isEmailConfigured, sendTestEmail } from "@/lib/email";
import { runMaintenance } from "@/lib/maintenance";
import { rateLimit } from "@/lib/rate-limit";
import { rateKey } from "@/lib/request";

export async function sendTestEmailAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const g = await guard("system:view");
  if (!g.ok) return g.state;
  if (!isEmailConfigured()) return errorState("SMTP yapılandırılmamış. SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD ve CONTACT_FROM_EMAIL değişkenlerini tanımlayın.");

  const limit = await rateLimit(rateKey("test-email", g.user.id), 5, 60 * 60);
  if (!limit.ok) return errorState("Çok fazla test e-postası gönderildi. Lütfen daha sonra tekrar deneyin.");

  const to = String(formData.get("to") ?? "").trim();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(to) || to.length > 200) return { status: "error", message: "Geçerli bir e-posta adresi girin.", fieldErrors: { to: "Geçerli bir e-posta adresi girin." } };

  try {
    await sendTestEmail(to);
    return successState(`Test e-postası ${to} adresine gönderildi. Gelen kutusunu (ve spam klasörünü) kontrol edin.`);
  } catch (error) {
    console.error("[system] test e-postası hatası:", error instanceof Error ? error.message : error);
    return errorState("E-posta gönderilemedi. SMTP bilgilerini ve sunucu günlüklerini kontrol edin.");
  }
}

export async function runMaintenanceAction(): Promise<void> {
  const g = await guard("system:view");
  if (!g.ok) return;
  const result = await runMaintenance(db);
  await audit({ user: g.user, action: "messages.purged", meta: result });
  revalidatePath("/admin/sistem");
}
