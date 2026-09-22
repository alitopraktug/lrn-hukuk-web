import { db } from "@/lib/db";
import { readMediaBytes } from "@/lib/media/storage";

export const runtime = "nodejs";

/**
 * Yüklenen görselleri servis eder. Kimlikler (cuid) tahmin edilemez ve değişmezdir → içerik-adresli, "immutable" önbellek.
 * İçerik türü, kullanıcının bildirdiği değil, yükleme sırasında doğrulanıp veritabanına yazılan değerdir; nosniff ile sabitlenir.
 * SVG'ler ayrıca sandbox CSP'si ile servis edilir (doğrudan açılsa bile betik çalıştıramaz).
 */
const ID_PATTERN = /^[a-z0-9]{16,40}$/;

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!ID_PATTERN.test(id)) return new Response("Not found", { status: 404, headers: { "Cache-Control": "no-store" } });

  const etag = `"${id}"`;
  if (request.headers.get("if-none-match") === etag) {
    return new Response(null, { status: 304, headers: { ETag: etag, "Cache-Control": "public, max-age=31536000, immutable" } });
  }

  const media = await db.media.findUnique({ where: { id }, select: { id: true, mimeType: true, size: true } });
  if (!media) return new Response("Not found", { status: 404, headers: { "Cache-Control": "no-store" } });
  const bytes = await readMediaBytes(media.id);
  if (!bytes) return new Response("Not found", { status: 404, headers: { "Cache-Control": "no-store" } });

  const headers: Record<string, string> = {
    "Content-Type": media.mimeType,
    "Content-Length": String(bytes.length),
    "Cache-Control": "public, max-age=31536000, immutable",
    ETag: etag,
    "X-Content-Type-Options": "nosniff",
    "Cross-Origin-Resource-Policy": "same-origin",
  };
  if (media.mimeType === "image/svg+xml") {
    headers["Content-Security-Policy"] = "default-src 'none'; style-src 'unsafe-inline'; sandbox";
  }
  return new Response(new Uint8Array(bytes), { status: 200, headers });
}
