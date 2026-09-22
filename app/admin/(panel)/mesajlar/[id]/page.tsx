import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteMessage, setMessageRead } from "@/app/admin/(panel)/mesajlar/actions";
import { ConfirmForm } from "@/components/admin/client";
import { Card, PageHeader, btnClass } from "@/components/admin/ui";
import { requireUser } from "@/lib/auth/guards";
import { db } from "@/lib/db";
import { formatDateTime } from "@/lib/utils";

export const metadata = { title: "Mesaj" };

export default async function MessageDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireUser({ permission: "message:read" });
  const { id } = await params;
  const m = await db.contactMessage.findUnique({ where: { id } });
  if (!m) notFound();
  // Mesaj açılınca okundu olarak işaretlenir.
  if (!m.read) await db.contactMessage.update({ where: { id }, data: { read: true } });

  return (
    <>
      <PageHeader
        title={m.subject}
        description={`${m.name} · ${formatDateTime(m.createdAt)}`}
        actions={
          <Link href="/admin/mesajlar" className={btnClass.secondary}>
            ← Mesajlar
          </Link>
        }
      />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <Card title="Mesaj">
          {/* Mesaj içeriği düz metin olarak render edilir (React otomatik kaçış yapar); HTML yorumlanmaz. */}
          <p className="whitespace-pre-wrap break-words text-[1rem] leading-relaxed">{m.message}</p>
        </Card>
        <div className="space-y-6">
          <Card title="Gönderen">
            <dl className="space-y-3 text-[0.92rem]">
              <div>
                <dt className="text-[0.78rem] font-bold uppercase tracking-wider text-quiet">Ad soyad</dt>
                <dd>{m.name}</dd>
              </div>
              <div>
                <dt className="text-[0.78rem] font-bold uppercase tracking-wider text-quiet">E-posta</dt>
                <dd>
                  <a className="text-forest hover:underline" href={`mailto:${m.email}`}>
                    {m.email}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-[0.78rem] font-bold uppercase tracking-wider text-quiet">Telefon</dt>
                <dd>{m.phone ? <a className="text-forest hover:underline" href={`tel:${m.phone.replace(/[^\d+]/g, "")}`}>{m.phone}</a> : "—"}</dd>
              </div>
              <div>
                <dt className="text-[0.78rem] font-bold uppercase tracking-wider text-quiet">Aydınlatma metni onayı</dt>
                <dd>{formatDateTime(m.consentAt)}</dd>
              </div>
              <div>
                <dt className="text-[0.78rem] font-bold uppercase tracking-wider text-quiet">Otomatik silinme</dt>
                <dd>{m.purgeAfter ? formatDateTime(m.purgeAfter) : "—"}</dd>
              </div>
            </dl>
          </Card>
          <div className="flex flex-wrap gap-2">
            <a href={`mailto:${m.email}?subject=${encodeURIComponent(`Re: ${m.subject}`)}`} className={btnClass.primary}>
              E-postayla yanıtla
            </a>
            <form action={setMessageRead}>
              <input type="hidden" name="id" value={m.id} />
              <input type="hidden" name="read" value="0" />
              <button className={btnClass.secondary}>Okunmadı işaretle</button>
            </form>
            <ConfirmForm action={deleteMessage} hidden={{ id: m.id, redirect: "1" }} title="Mesaj silinsin mi?" message="Mesaj kalıcı olarak silinecek. Bu işlem geri alınamaz." confirmLabel="Kalıcı olarak sil">
              Sil
            </ConfirmForm>
          </div>
        </div>
      </div>
    </>
  );
}
