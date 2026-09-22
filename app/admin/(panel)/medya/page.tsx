import { updateMediaAlt, deleteMedia } from "@/app/admin/(panel)/medya/actions";
import { ConfirmForm } from "@/components/admin/client";
import { Badge, Card, PageHeader, btnClass, inputClass } from "@/components/admin/ui";
import { UploadPanel } from "@/app/admin/(panel)/medya/upload-panel";
import { requireUser } from "@/lib/auth/guards";
import { db } from "@/lib/db";
import { formatShortDate } from "@/lib/utils";

export const metadata = { title: "Medya" };

const PURPOSE_LABEL: Record<string, string> = { GENERAL: "Genel", PHOTO: "Portre", COVER: "Kapak", OG: "Paylaşım (OG)", LOGO: "Logo", FAVICON: "Favicon" };

const formatBytes = (n: number) => (n > 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`);

export default async function MediaPage() {
  await requireUser({ permission: "media:manage" });
  const [items, total] = await Promise.all([
    db.media.findMany({
      orderBy: { createdAt: "desc" },
      take: 60,
      select: {
        id: true,
        filename: true,
        alt: true,
        purpose: true,
        size: true,
        width: true,
        height: true,
        createdAt: true,
        _count: { select: { areaCovers: true, areaOgs: true, teamPhotos: true, pubCovers: true, pubOgs: true, pageOgs: true, siteLogos: true, siteIcons: true, siteOgs: true } },
      },
    }),
    db.media.aggregate({ _count: true, _sum: { size: true } }),
  ]);

  return (
    <>
      <PageHeader title="Medya" description={`${total._count} görsel · toplam ${formatBytes(total._sum.size ?? 0)}. Yüklenen görseller otomatik olarak optimize edilir (WebP, en fazla 2400 px). Görseller genellikle içerik düzenlerken ilgili alandan yüklenir.`} />
      <UploadPanel />
      {items.length === 0 ? (
        <p className="mt-8 text-quiet">Henüz görsel yok.</p>
      ) : (
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((m) => {
            const used = Object.values(m._count).reduce((a, b) => a + b, 0);
            return (
              <li key={m.id}>
                <Card className="h-full overflow-hidden !p-0">
                  <div className="relative aspect-[4/3] bg-admin">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={`/media/${m.id}`} alt={m.alt || "Görsel"} loading="lazy" className="absolute inset-0 h-full w-full object-contain" />
                  </div>
                  <div className="space-y-3 p-4">
                    <div className="flex flex-wrap items-center gap-2 text-[0.8rem] text-quiet">
                      <Badge>{PURPOSE_LABEL[m.purpose]}</Badge>
                      <span>{m.width && m.height ? `${m.width}×${m.height}` : ""}</span>
                      <span>{formatBytes(m.size)}</span>
                      <span>{formatShortDate(m.createdAt)}</span>
                    </div>
                    <p className="truncate text-[0.85rem] font-medium">{m.filename}</p>
                    <form action={updateMediaAlt} className="flex gap-2">
                      <input type="hidden" name="id" value={m.id} />
                      <label htmlFor={`alt-${m.id}`} className="sr-only">
                        Alternatif metin
                      </label>
                      <input id={`alt-${m.id}`} name="alt" defaultValue={m.alt} maxLength={200} placeholder="Alternatif metin" className={inputClass} />
                      <button className={btnClass.secondary}>Kaydet</button>
                    </form>
                    <div className="flex items-center justify-between">
                      <span className="text-[0.8rem] text-quiet">{used ? `${used} yerde kullanılıyor` : "Kullanılmıyor"}</span>
                      <ConfirmForm
                        action={deleteMedia}
                        hidden={{ id: m.id }}
                        title="Görsel silinsin mi?"
                        message={used ? `Bu görsel ${used} yerde kullanılıyor; silinirse o alanlar görselsiz kalır.` : "Görsel kalıcı olarak silinecek."}
                        confirmLabel="Sil"
                      >
                        Sil
                      </ConfirmForm>
                    </div>
                  </div>
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
