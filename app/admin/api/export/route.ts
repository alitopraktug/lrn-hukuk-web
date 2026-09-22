import { audit } from "@/lib/audit";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { can } from "@/lib/permissions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** CSV enjeksiyonuna karşı: =, +, -, @ ile başlayan hücrelerin başına tek tırnak eklenir. */
function csvCell(value: unknown): string {
  let s = value === null || value === undefined ? "" : value instanceof Date ? value.toISOString() : String(value);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
}

/**
 * Veri dışa aktarma (satıcıya bağımlılığı azaltmak için): içerik JSON, mesajlar CSV.
 * Kullanıcı parolaları, oturumlar ve gizli anahtarlar dışa aktarılmaz. Yalnızca yöneticiler.
 * Tam yedek için `pg_dump` kullanın (README → Yedekleme).
 */
export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user || !can(user.role, "system:view")) return new Response("Unauthorized", { status: 401 });
  const type = new URL(request.url).searchParams.get("type");
  const stamp = new Date().toISOString().slice(0, 10);

  if (type === "messages") {
    const rows = await db.contactMessage.findMany({ orderBy: { createdAt: "desc" } });
    const header = ["Tarih", "Ad soyad", "E-posta", "Telefon", "Konu", "Mesaj", "Okundu"];
    const csv = [header.map(csvCell).join(","), ...rows.map((r) => [r.createdAt, r.name, r.email, r.phone, r.subject, r.message, r.read ? "evet" : "hayır"].map(csvCell).join(","))].join("\r\n");
    await audit({ user, action: "data.exported", meta: { type: "messages", rows: rows.length } });
    return new Response(String.fromCharCode(0xfeff) + csv, {
      headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="iletisim-mesajlari-${stamp}.csv"`, "Cache-Control": "no-store" },
    });
  }

  if (type === "content") {
    const [settings, pages, areas, team, publications, categories] = await Promise.all([
      db.siteSetting.findUnique({ where: { id: "site" } }),
      db.page.findMany(),
      db.practiceArea.findMany({ orderBy: { sortOrder: "asc" }, include: { teamMembers: { select: { slug: true } } } }),
      db.teamMember.findMany({ orderBy: { sortOrder: "asc" }, include: { practiceAreas: { select: { slug: true } } } }),
      db.publication.findMany({ orderBy: { createdAt: "asc" }, include: { tags: { select: { name: true } }, category: { select: { slug: true } }, author: { select: { slug: true } } } }),
      db.category.findMany({ orderBy: { sortOrder: "asc" } }),
    ]);
    await audit({ user, action: "data.exported", meta: { type: "content", publications: publications.length } });
    const body = JSON.stringify({ exportedAt: new Date().toISOString(), version: 1, settings, pages, categories, practiceAreas: areas, team, publications }, null, 2);
    return new Response(body, {
      headers: { "Content-Type": "application/json; charset=utf-8", "Content-Disposition": `attachment; filename="lrn-hukuk-icerik-${stamp}.json"`, "Cache-Control": "no-store" },
    });
  }

  return new Response("type=content veya type=messages belirtin.", { status: 400 });
}
