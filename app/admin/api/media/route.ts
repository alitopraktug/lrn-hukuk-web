import { NextResponse } from "next/server";
import type { MediaPurpose } from "@/generated/prisma/client";
import { audit } from "@/lib/audit";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { MAX_UPLOAD_BYTES, processUpload, UploadError } from "@/lib/media/process";
import { saveMediaBytes } from "@/lib/media/storage";
import { can } from "@/lib/permissions";
import { rateLimit } from "@/lib/rate-limit";
import { isSameOrigin, rateKey } from "@/lib/request";

export const runtime = "nodejs";

const PURPOSES = ["GENERAL", "PHOTO", "COVER", "OG", "LOGO", "FAVICON"] as const;
const IMAGE_POOL: MediaPurpose[] = ["GENERAL", "PHOTO", "COVER"];

const json = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });

/** Görsel seçici için kütüphane listesi (yalnızca oturum açmış, yetkili kullanıcılar). */
export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user || !can(user.role, "media:manage")) return json({ error: "Yetkisiz." }, 401);

  const purpose = new URL(request.url).searchParams.get("purpose") as MediaPurpose | null;
  const pool = purpose && (PURPOSES as readonly string[]).includes(purpose) ? (IMAGE_POOL.includes(purpose) ? IMAGE_POOL : [purpose]) : IMAGE_POOL;

  const items = await db.media.findMany({
    where: { purpose: { in: pool } },
    orderBy: { createdAt: "desc" },
    take: 80,
    select: { id: true, alt: true, width: true, height: true, filename: true, purpose: true, mimeType: true },
  });
  return json({ items });
}

/** Görsel yükleme: oturum + yetki + Origin doğrulaması, hız sınırı, içerik doğrulama ve yeniden kodlama. */
export async function POST(request: Request) {
  if (!isSameOrigin(request)) return json({ error: "Geçersiz istek kaynağı." }, 403);
  const user = await getCurrentUser();
  if (!user || !can(user.role, "media:manage")) return json({ error: "Yetkisiz." }, 401);

  const limit = await rateLimit(rateKey("upload", user.id), 60, 60 * 60);
  if (!limit.ok) return json({ error: "Çok fazla yükleme yapıldı. Lütfen daha sonra tekrar deneyin." }, 429);

  const length = Number(request.headers.get("content-length") ?? 0);
  if (length > MAX_UPLOAD_BYTES + 512 * 1024) return json({ error: "Dosya boyutu en fazla 8 MB olabilir." }, 413);

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return json({ error: "İstek okunamadı." }, 400);
  }
  const file = form.get("file");
  if (!(file instanceof File)) return json({ error: "Dosya bulunamadı." }, 400);
  const rawPurpose = String(form.get("purpose") ?? "GENERAL");
  const purpose = ((PURPOSES as readonly string[]).includes(rawPurpose) ? rawPurpose : "GENERAL") as MediaPurpose;

  try {
    const processed = await processUpload(file, purpose);
    const alt = String(form.get("alt") ?? "").replace(/\s+/g, " ").trim().slice(0, 200);
    const media = await db.media.create({
      data: {
        purpose,
        filename: processed.filename,
        mimeType: processed.mimeType,
        size: processed.data.length,
        width: processed.width,
        height: processed.height,
        alt,
        blurDataUrl: processed.blurDataUrl,
        createdById: user.id,
      },
      select: { id: true, alt: true, width: true, height: true, filename: true },
    });
    await saveMediaBytes(media.id, processed.data);
    await audit({ user, action: "media.uploaded", entity: "Media", entityId: media.id, meta: { filename: processed.filename, bytes: processed.data.length, purpose } });
    return json({ media });
  } catch (error) {
    if (error instanceof UploadError) return json({ error: error.message }, 400);
    console.error("[media] yükleme hatası:", error instanceof Error ? error.message : error);
    return json({ error: "Görsel yüklenemedi." }, 500);
  }
}
