import "server-only";
import { db } from "@/lib/db";

/**
 * Medya depolama soyutlaması.
 * Varsayılan sürücü "database": dosya baytları PostgreSQL'deki MediaBlob tablosunda tutulur. Böylece
 *  - tek bir yedekleme (pg_dump) hem içeriği hem görselleri kapsar,
 *  - Vercel gibi kalıcı disk olmayan ortamlarda da çalışır,
 *  - herhangi bir bulut sağlayıcıya bağımlılık oluşmaz.
 * Görseller 2400px/WebP ile sınırlı olduğundan bir büro sitesi için boyut kaygı yaratmaz; medya çok büyürse
 * ek bir sürücü (S3 uyumlu depolama) bu arayüzün arkasına eklenebilir.
 */
export async function saveMediaBytes(mediaId: string, data: Buffer): Promise<void> {
  await db.mediaBlob.upsert({
    where: { mediaId },
    create: { mediaId, data: new Uint8Array(data) },
    update: { data: new Uint8Array(data) },
  });
}

export async function readMediaBytes(mediaId: string): Promise<Buffer | null> {
  const blob = await db.mediaBlob.findUnique({ where: { mediaId } });
  return blob ? Buffer.from(blob.data) : null;
}

/** Media satırı silindiğinde MediaBlob (onDelete: Cascade) otomatik silinir; ek depolama sürücüleri için kanca. */
export async function deleteMediaBytes(_mediaId: string): Promise<void> {
  /* database sürücüsü: cascade ile temizlenir */
}
