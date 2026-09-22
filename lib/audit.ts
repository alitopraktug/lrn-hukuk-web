import "server-only";
import type { Prisma } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import { getClientIp } from "@/lib/request";

/**
 * Denetim kaydı. Parola, token, TOTP sırrı vb. HASSAS veri asla `meta` içine konmaz.
 * Kayıt hatası asıl işlemi bozmaz (yalnızca konsola yazılır).
 */
export type AuditInput = {
  user?: { id: string; email: string } | null;
  action: string;
  entity?: string;
  entityId?: string;
  meta?: Prisma.InputJsonValue;
  userEmail?: string;
};

export async function audit(input: AuditInput): Promise<void> {
  try {
    const ip = await getClientIp();
    await db.auditLog.create({
      data: {
        userId: input.user?.id ?? null,
        userEmail: input.user?.email ?? input.userEmail ?? null,
        action: input.action,
        entity: input.entity,
        entityId: input.entityId,
        meta: input.meta,
        ip: ip === "unknown" ? null : ip,
      },
    });
  } catch (error) {
    console.error("[audit] kayıt yazılamadı:", error instanceof Error ? error.message : error);
  }
}

export const AUDIT_LABELS: Record<string, string> = {
  "login.success": "Oturum açıldı",
  "login.failed": "Başarısız giriş denemesi",
  "login.locked": "Hesap geçici olarak kilitlendi",
  "login.2fa.failed": "Başarısız iki adımlı doğrulama",
  logout: "Oturum kapatıldı",
  "password.changed": "Parola değiştirildi",
  "password.reset.requested": "Parola sıfırlama istendi",
  "password.reset.completed": "Parola sıfırlandı",
  "2fa.enabled": "İki adımlı doğrulama açıldı",
  "2fa.disabled": "İki adımlı doğrulama kapatıldı",
  "user.created": "Kullanıcı oluşturuldu",
  "user.updated": "Kullanıcı güncellendi",
  "user.deactivated": "Kullanıcı pasife alındı",
  "publication.created": "Yayın oluşturuldu",
  "publication.updated": "Yayın güncellendi",
  "publication.published": "Yayın yayımlandı",
  "publication.unpublished": "Yayın taslağa alındı",
  "publication.deleted": "Yayın silindi",
  "publication.restored": "Yayın geri yüklendi",
  "publication.purged": "Yayın kalıcı olarak silindi",
  "area.created": "Çalışma alanı oluşturuldu",
  "area.updated": "Çalışma alanı güncellendi",
  "area.deleted": "Çalışma alanı silindi",
  "area.restored": "Çalışma alanı geri yüklendi",
  "area.reordered": "Çalışma alanı sırası değişti",
  "team.created": "Ekip üyesi eklendi",
  "team.updated": "Ekip üyesi güncellendi",
  "team.deleted": "Ekip üyesi silindi",
  "team.restored": "Ekip üyesi geri yüklendi",
  "team.reordered": "Ekip sırası değişti",
  "page.updated": "Sayfa güncellendi",
  "settings.updated": "Site ayarları güncellendi",
  "seo.updated": "SEO ayarları güncellendi",
  "media.uploaded": "Medya yüklendi",
  "media.deleted": "Medya silindi",
  "message.deleted": "İletişim mesajı silindi",
  "messages.purged": "Süresi dolan mesajlar silindi",
  "data.exported": "Veri dışa aktarıldı",
};
