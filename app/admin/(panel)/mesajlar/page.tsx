import Link from "next/link";
import { markAllRead, purgeExpiredMessages } from "@/app/admin/(panel)/mesajlar/actions";
import { ConfirmForm } from "@/components/admin/client";
import { AdminPager, Alert, Badge, EmptyRow, PageHeader, Table, Tabs, btnClass, td, th } from "@/components/admin/ui";
import { requireUser } from "@/lib/auth/guards";
import { db } from "@/lib/db";
import { formatDateTime } from "@/lib/utils";

export const metadata = { title: "İletişim mesajları" };
const PAGE_SIZE = 20;

export default async function MessagesPage({ searchParams }: { searchParams: Promise<{ durum?: string; sayfa?: string }> }) {
  await requireUser({ permission: "message:read" });
  const sp = await searchParams;
  const unreadOnly = sp.durum === "okunmamis";
  const page = Math.max(1, Number.parseInt(sp.sayfa ?? "1", 10) || 1);
  const where = unreadOnly ? { read: false } : {};

  const [total, unread, expired, settings] = await Promise.all([
    db.contactMessage.count({ where }),
    db.contactMessage.count({ where: { read: false } }),
    db.contactMessage.count({ where: { purgeAfter: { lt: new Date() } } }),
    db.siteSetting.findUnique({ where: { id: "site" }, select: { storeContactMessages: true, messageRetentionDays: true } }),
  ]);
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const items = await db.contactMessage.findMany({
    where,
    orderBy: { createdAt: "desc" },
    skip: (Math.min(page, pageCount) - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
    select: { id: true, name: true, email: true, phone: true, subject: true, read: true, emailSent: true, createdAt: true },
  });
  const href = (p: number) => `/admin/mesajlar?${new URLSearchParams({ ...(unreadOnly ? { durum: "okunmamis" } : {}), ...(p > 1 ? { sayfa: String(p) } : {}) }).toString()}`;

  return (
    <>
      <PageHeader
        title="İletişim mesajları"
        description={`İletişim formundan gelen mesajlar. Mesajlar ${settings?.messageRetentionDays ?? 365} gün sonra otomatik silinmek üzere işaretlenir (Site Ayarları'ndan değiştirilebilir).`}
        actions={
          unread > 0 ? (
            <form action={markAllRead}>
              <button className={btnClass.secondary}>Tümünü okundu işaretle</button>
            </form>
          ) : null
        }
      />
      {settings && !settings.storeContactMessages ? (
        <Alert tone="info" className="mb-6">
          Mesaj kaydı kapalı: iletişim formu mesajları yalnızca e-posta ile iletilir, burada görünmez. Açmak için Site Ayarları → İletişim formu bölümüne bakın.
        </Alert>
      ) : null}
      {expired > 0 ? (
        <Alert tone="warning" className="mb-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span>Saklama süresi dolmuş {expired} mesaj var.</span>
            <ConfirmForm action={purgeExpiredMessages} title="Süresi dolan mesajlar silinsin mi?" message={`Saklama süresi dolmuş ${expired} mesaj kalıcı olarak silinecek.`} confirmLabel="Kalıcı olarak sil" variant="danger">
              Süresi dolanları sil
            </ConfirmForm>
          </div>
        </Alert>
      ) : null}
      <Tabs
        items={[
          { href: "/admin/mesajlar", label: "Tümü", active: !unreadOnly },
          { href: "/admin/mesajlar?durum=okunmamis", label: "Okunmamış", active: unreadOnly, count: unread },
        ]}
      />
      <Table>
        <thead>
          <tr>
            <th className={th}>Gönderen</th>
            <th className={th}>Konu</th>
            <th className={`${th} hidden md:table-cell`}>Tarih</th>
            <th className={th}>Durum</th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <EmptyRow colSpan={4}>Mesaj yok.</EmptyRow>
          ) : (
            items.map((m) => (
              <tr key={m.id} className="hover:bg-admin/40">
                <td className={td}>
                  <Link href={`/admin/mesajlar/${m.id}`} className={`text-forest hover:underline ${m.read ? "font-medium" : "font-bold"}`}>
                    {m.name}
                  </Link>
                  <div className="text-[0.8rem] text-quiet">{m.email}</div>
                </td>
                <td className={`${td} max-w-[18rem] truncate ${m.read ? "" : "font-semibold"}`}>{m.subject}</td>
                <td className={`${td} hidden whitespace-nowrap md:table-cell`}>{formatDateTime(m.createdAt)}</td>
                <td className={td}>
                  <div className="flex flex-wrap gap-1">
                    {m.read ? <Badge>Okundu</Badge> : <Badge tone="red">Yeni</Badge>}
                    {!m.emailSent ? <Badge tone="amber">E-posta gitmedi</Badge> : null}
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </Table>
      <AdminPager page={Math.min(page, pageCount)} pageCount={pageCount} makeHref={href} />
    </>
  );
}
