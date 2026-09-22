import Link from "next/link";
import { CheckCircle2, Circle } from "lucide-react";
import { Alert, Badge, Card, PageHeader, btnClass } from "@/components/admin/ui";
import { getReadiness } from "@/lib/admin/readiness";
import { requireUser } from "@/lib/auth/guards";
import { db } from "@/lib/db";
import { can } from "@/lib/permissions";
import { formatDateTime } from "@/lib/utils";

export const metadata = { title: "Ana Panel" };

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ yetkisiz?: string }> }) {
  const user = await requireUser();
  const sp = await searchParams;
  const canMessages = can(user.role, "message:read");
  const canSystem = can(user.role, "system:view");

  const [pubTotal, pubPublished, pubDraft, teamCount, areaCount, messages, readiness] = await Promise.all([
    db.publication.count({ where: { deletedAt: null } }),
    db.publication.count({ where: { deletedAt: null, status: "PUBLISHED" } }),
    db.publication.count({ where: { deletedAt: null, status: "DRAFT" } }),
    db.teamMember.count({ where: { deletedAt: null, status: "PUBLISHED" } }),
    db.practiceArea.count({ where: { deletedAt: null, status: "PUBLISHED" } }),
    canMessages ? db.contactMessage.findMany({ orderBy: { createdAt: "desc" }, take: 5, select: { id: true, name: true, subject: true, read: true, createdAt: true } }) : [],
    canSystem ? getReadiness(user) : [],
  ]);

  const stats = [
    { label: "Toplam yayın", value: pubTotal },
    { label: "Yayında", value: pubPublished },
    { label: "Taslak", value: pubDraft },
    { label: "Aktif ekip üyesi", value: teamCount },
    { label: "Yayındaki çalışma alanı", value: areaCount },
  ];
  const required = readiness.filter((r) => !r.optional);
  const doneCount = required.filter((r) => r.done).length;

  return (
    <>
      <PageHeader
        title={`Hoş geldiniz, ${user.name.split(" ")[0]}`}
        description="Sitenizin içeriğini buradan yönetebilirsiniz."
        actions={
          <Link href="/admin/yayinlar/yeni" className={btnClass.primary}>
            Yeni yayın ekle
          </Link>
        }
      />
      {sp.yetkisiz ? (
        <Alert tone="warning" className="mb-6">
          Bu bölüm için yetkiniz bulunmuyor.
        </Alert>
      ) : null}

      <dl className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border border-line bg-white px-4 py-4">
            <dt className="text-[0.8rem] font-semibold text-quiet">{s.label}</dt>
            <dd className="mt-1 font-serif text-4xl leading-none">{s.value}</dd>
          </div>
        ))}
      </dl>

      <div className="grid gap-6 lg:grid-cols-2">
        {canSystem ? (
          <Card title="Yayına hazırlık" description={`${doneCount} / ${required.length} zorunlu madde tamamlandı`}>
            <ul className="divide-y divide-line">
              {readiness.map((r) => (
                <li key={r.id} className="flex items-start gap-3 py-3">
                  {r.done ? (
                    <CheckCircle2 size={20} aria-hidden="true" className="mt-0.5 shrink-0 text-forest" />
                  ) : (
                    <Circle size={20} aria-hidden="true" className="mt-0.5 shrink-0 text-stone" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className={r.done ? "text-quiet line-through decoration-stone" : "font-medium"}>
                      {r.label}
                      {r.optional ? <span className="ml-2 text-[0.75rem] font-normal text-quiet">(isteğe bağlı)</span> : null}
                      <span className="sr-only">{r.done ? " — tamamlandı" : " — bekliyor"}</span>
                    </p>
                    {!r.done && r.hint ? <p className="mt-0.5 text-[0.82rem] text-quiet">{r.hint}</p> : null}
                  </div>
                  {!r.done && r.href ? (
                    <Link href={r.href} className="shrink-0 text-[0.85rem] font-semibold text-forest hover:underline">
                      Git
                    </Link>
                  ) : null}
                </li>
              ))}
            </ul>
          </Card>
        ) : null}

        {canMessages ? (
          <Card title="Son iletişim mesajları" actions={<Link href="/admin/mesajlar" className="text-[0.85rem] font-semibold text-forest hover:underline">Tümü</Link>}>
            {messages.length === 0 ? (
              <p className="text-quiet">Henüz mesaj yok.</p>
            ) : (
              <ul className="divide-y divide-line">
                {messages.map((m) => (
                  <li key={m.id}>
                    <Link href={`/admin/mesajlar/${m.id}`} className="flex items-start justify-between gap-3 py-3 hover:bg-admin/40">
                      <span className="min-w-0">
                        <span className={`block truncate ${m.read ? "" : "font-bold"}`}>{m.subject}</span>
                        <span className="block truncate text-[0.82rem] text-quiet">
                          {m.name} · {formatDateTime(m.createdAt)}
                        </span>
                      </span>
                      {!m.read ? <Badge tone="red">Yeni</Badge> : null}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        ) : null}
      </div>
    </>
  );
}
