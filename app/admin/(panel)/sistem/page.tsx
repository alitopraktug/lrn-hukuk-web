import { CheckCircle2, Download, XCircle } from "lucide-react";
import { runMaintenanceAction } from "@/app/admin/(panel)/sistem/actions";
import { TestEmailForm } from "@/app/admin/(panel)/sistem/test-email-form";
import { AdminPager, Alert, Card, PageHeader, Table, btnClass, td, th } from "@/components/admin/ui";
import { AUDIT_LABELS } from "@/lib/audit";
import { requireUser } from "@/lib/auth/guards";
import { db } from "@/lib/db";
import { env } from "@/lib/env";
import { isEmailConfigured } from "@/lib/email";
import { formatDateTime } from "@/lib/utils";

export const metadata = { title: "Sistem ve yedekleme" };
const LOG_PAGE_SIZE = 25;

async function checkDatabase(): Promise<{ ok: boolean; ms: number }> {
  const started = Date.now();
  try {
    await db.$queryRaw`SELECT 1`;
    return { ok: true, ms: Date.now() - started };
  } catch {
    return { ok: false, ms: Date.now() - started };
  }
}

function Status({ ok, children, detail }: { ok: boolean; children: React.ReactNode; detail?: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3 py-3">
      {ok ? <CheckCircle2 size={20} aria-hidden="true" className="mt-0.5 shrink-0 text-forest" /> : <XCircle size={20} aria-hidden="true" className="mt-0.5 shrink-0 text-danger" />}
      <div>
        <p className="font-medium">
          {children}
          <span className="sr-only">{ok ? " — tamam" : " — sorun var"}</span>
        </p>
        {detail ? <p className="mt-0.5 text-[0.85rem] text-quiet">{detail}</p> : null}
      </div>
    </li>
  );
}

export default async function SystemPage({ searchParams }: { searchParams: Promise<{ sayfa?: string }> }) {
  const user = await requireUser({ permission: "system:view" });
  const page = Math.max(1, Number.parseInt((await searchParams).sayfa ?? "1", 10) || 1);

  const { ok: dbOk, ms: dbMs } = await checkDatabase();

  const [mediaAgg, logTotal, expired, settings] = await Promise.all([
    db.media.aggregate({ _count: true, _sum: { size: true } }),
    db.auditLog.count(),
    db.contactMessage.count({ where: { purgeAfter: { lt: new Date() } } }),
    db.siteSetting.findUnique({ where: { id: "site" }, select: { contactRecipientEmail: true } }),
  ]);
  const pageCount = Math.max(1, Math.ceil(logTotal / LOG_PAGE_SIZE));
  const logs = await db.auditLog.findMany({ orderBy: { createdAt: "desc" }, skip: (Math.min(page, pageCount) - 1) * LOG_PAGE_SIZE, take: LOG_PAGE_SIZE });

  const smtp = env.smtp;
  const https = env.siteUrl.startsWith("https://");
  const mediaMb = ((mediaAgg._sum.size ?? 0) / 1024 / 1024).toFixed(1);

  return (
    <>
      <PageHeader title="Sistem ve yedekleme" description="Sunucu durumu, veri dışa aktarma, bakım ve işlem kayıtları." />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Sistem durumu">
          <ul className="divide-y divide-line">
            <Status ok={dbOk} detail={dbOk ? `Yanıt süresi ${dbMs} ms` : "Veritabanına bağlanılamadı."}>
              Veritabanı (PostgreSQL)
            </Status>
            <Status ok={https} detail={env.siteUrl}>
              Site adresi {https ? "https ile yapılandırılmış" : "https değil (yayında https zorunludur)"}
            </Status>
            <Status ok={isEmailConfigured()} detail={smtp ? `${smtp.host}:${smtp.port}` : "SMTP_HOST tanımlı değil"}>
              E-posta (SMTP)
            </Status>
            <Status ok={Boolean(env.cronSecret)} detail="Vercel Cron veya harici cron ile /api/cron/maintenance çağrısı için (isteğe bağlı; sunucuda `npm run maintenance` da kullanılabilir).">
              Bakım rotası (CRON_SECRET)
            </Status>
            <Status ok detail={`${mediaAgg._count} görsel · ${mediaMb} MB (veritabanında saklanır)`}>
              Medya depolama
            </Status>
          </ul>
          <p className="mt-4 text-[0.82rem] text-quiet">Node {process.version} · {env.isProd ? "üretim" : "geliştirme"} modu</p>
        </Card>

        <Card title="E-posta testi" description="SMTP ayarlarının çalıştığını doğrulayın.">
          <TestEmailForm defaultTo={settings?.contactRecipientEmail || env.contactToEmail || user.email} disabled={!isEmailConfigured()} />
        </Card>

        <Card title="Veri dışa aktarma" description="Verileriniz size aittir ve her zaman dışa aktarılabilir.">
          <div className="flex flex-wrap gap-3">
            <a href="/admin/api/export?type=content" className={btnClass.secondary}>
              <Download size={16} aria-hidden="true" />
              İçerik (JSON)
            </a>
            <a href="/admin/api/export?type=messages" className={btnClass.secondary}>
              <Download size={16} aria-hidden="true" />
              Mesajlar (CSV)
            </a>
          </div>
          <p className="mt-4 text-[0.85rem] text-quiet">Kullanıcı parolaları ve oturumlar dışa aktarılmaz. Görsellerin kendisi veritabanında saklandığından tam yedek için aşağıdaki veritabanı yedeğini kullanın.</p>
        </Card>

        <Card title="Bakım" description="Saklama süresi dolan mesajlar, süresi geçmiş oturumlar ve eski kayıtlar silinir.">
          <form action={runMaintenanceAction}>
            <button className={btnClass.secondary}>Bakım görevlerini şimdi çalıştır</button>
          </form>
          {expired > 0 ? <p className="mt-3 text-[0.85rem] text-quiet">Şu an saklama süresi dolmuş {expired} mesaj var.</p> : null}
        </Card>
      </div>

      <Card title="Yedekleme ve geri yükleme" className="mt-6" description="Yedekleme, hosting sağlayıcınızdaki veritabanı ayarlarından veya aşağıdaki komutlarla yapılır. Ayrıntılar README → Yedekleme bölümündedir.">
        <Alert tone="info" className="mb-4">
          <strong>Yedeklenmesi gereken her şey PostgreSQL veritabanındadır</strong> (içerik, ekip, yayınlar, mesajlar ve yüklenen görseller). Kaynak kod ve ortam değişkenleri ayrıca depoda/hosting panelinde saklanmalıdır.
        </Alert>
        <pre className="overflow-x-auto rounded-lg bg-ink p-4 text-[0.82rem] leading-relaxed text-background/90">
          <code>{`# Günlük yedek (cron)
pg_dump --format=custom --no-owner "$DATABASE_URL" > lrn-hukuk-$(date +%F).dump

# Geri yükleme (önce BOŞ bir veritabanı oluşturun, sonra)
pg_restore --no-owner --dbname "$YENI_DATABASE_URL" lrn-hukuk-2026-01-01.dump

# Geri yükleme testi (en az ayda bir): yedeği ayrı bir veritabanına yükleyip siteyi açın.`}</code>
        </pre>
      </Card>

      <div className="mt-6">
        <h2 className="mb-3 font-sans text-[1.05rem] font-bold">İşlem kayıtları</h2>
        <p className="mb-4 max-w-2xl text-[0.88rem] text-quiet">Girişler ve kritik değişiklikler kaydedilir (parola, token gibi hassas bilgiler asla kaydedilmez). Kayıtlar 2 yıl saklanır.</p>
        <Table>
          <thead>
            <tr>
              <th className={th}>Tarih</th>
              <th className={th}>Kullanıcı</th>
              <th className={th}>İşlem</th>
              <th className={`${th} hidden md:table-cell`}>Kayıt</th>
              <th className={`${th} hidden lg:table-cell`}>IP</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((l) => (
              <tr key={l.id}>
                <td className={`${td} whitespace-nowrap`}>{formatDateTime(l.createdAt)}</td>
                <td className={td}>{l.userEmail ?? "—"}</td>
                <td className={td}>{AUDIT_LABELS[l.action] ?? l.action}</td>
                <td className={`${td} hidden max-w-[16rem] truncate md:table-cell`}>{[l.entity, (l.meta as { title?: string; fullName?: string } | null)?.title ?? (l.meta as { fullName?: string } | null)?.fullName].filter(Boolean).join(" · ") || "—"}</td>
                <td className={`${td} hidden lg:table-cell`}>{l.ip ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </Table>
        <AdminPager page={Math.min(page, pageCount)} pageCount={pageCount} makeHref={(p) => `/admin/sistem?sayfa=${p}`} />
      </div>
    </>
  );
}
