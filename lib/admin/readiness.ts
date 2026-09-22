import "server-only";
import { db } from "@/lib/db";
import { env } from "@/lib/env";
import { isEmailConfigured } from "@/lib/email";
import { getSiteSettings } from "@/lib/data/site";
import type { SessionUser } from "@/lib/auth/session";

export type ReadinessItem = { id: string; label: string; done: boolean; href?: string; hint?: string; optional?: boolean };

/**
 * "Yayına hazırlık" kontrol listesi — gerçek durum denetimleridir, gösteriş metriği değildir.
 * Hukuki metinler için "onaylandı" işareti, LRN Hukuk'un hukukçusunun metni kontrol ettiğini kayda geçirir.
 */
export async function getReadiness(user: SessionUser): Promise<ReadinessItem[]> {
  const [settings, teamPublished, pages, demoTeam, demoPubs, areasPublished] = await Promise.all([
    getSiteSettings(),
    db.teamMember.count({ where: { status: "PUBLISHED", deletedAt: null, isDemo: false } }),
    db.page.findMany({ where: { key: { in: ["kvkk", "cookies", "privacy", "terms"] } }, select: { key: true, reviewedAt: true } }),
    db.teamMember.count({ where: { isDemo: true } }),
    db.publication.count({ where: { isDemo: true } }),
    db.practiceArea.count({ where: { status: "PUBLISHED", deletedAt: null } }),
  ]);
  const reviewed = (key: string) => Boolean(pages.find((p) => p.key === key)?.reviewedAt);

  return [
    { id: "https", label: "Site adresi https ile yapılandırılmış", done: env.siteUrl.startsWith("https://"), hint: "NEXT_PUBLIC_SITE_URL ortam değişkeni https://alanadi.com olmalıdır.", href: "/admin/sistem" },
    { id: "contact", label: "İletişim bilgileri (adres, telefon, e-posta) girilmiş", done: Boolean(settings.address && settings.phone && settings.email), href: "/admin/ayarlar" },
    { id: "smtp", label: "E-posta gönderimi (SMTP) çalışıyor", done: isEmailConfigured(), hint: "İletişim formu bildirimleri için SMTP ayarları gerekir.", href: "/admin/sistem" },
    { id: "team", label: "En az bir ekip profili yayında", done: teamPublished > 0, hint: "Ekip sayfasındaki kayıtları gerçek bilgilerle doldurup 'Aktif' yapın.", href: "/admin/ekip" },
    { id: "areas", label: "Çalışma alanları yayında", done: areasPublished > 0, href: "/admin/calisma-alanlari" },
    { id: "kvkk", label: "KVKK Aydınlatma Metni hukukçu tarafından onaylandı", done: reviewed("kvkk"), hint: "Yer tutucu metin yayına alınmadan önce tamamlanmalıdır.", href: "/admin/sayfalar/kvkk" },
    { id: "cookies", label: "Çerez Politikası onaylandı", done: reviewed("cookies"), href: "/admin/sayfalar/cookies" },
    { id: "privacy", label: "Gizlilik ve Kullanım Koşulları metinleri onaylandı", done: reviewed("privacy") && reviewed("terms"), href: "/admin/sayfalar" },
    { id: "demo", label: "Demo içerik kaldırıldı", done: demoTeam + demoPubs === 0, hint: "Geliştirme sırasında eklenen 'Demo İçerik' kayıtlarını silin.", href: "/admin/yayinlar" },
    { id: "2fa", label: "Hesabınızda iki adımlı doğrulama açık", done: user.totpEnabled, hint: "Üretim ortamında önerilir.", href: "/admin/hesabim" },
    { id: "ga", label: "Google Analytics (isteğe bağlı) tanımlı", done: Boolean(settings.gaMeasurementId), optional: true, href: "/admin/ayarlar" },
  ];
}
