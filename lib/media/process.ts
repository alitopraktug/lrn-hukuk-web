import "server-only";
import sharp from "sharp";
import type { MediaPurpose } from "@/generated/prisma/client";
import { sanitizeSvg } from "@/lib/richtext";
import { slugify } from "@/lib/slug";

/**
 * Yükleme güvenliği ve optimizasyonu:
 *  - dosya boyutu sınırı, izinli tür beyaz listesi, gerçek içerik (magic byte) doğrulaması — bildirilen MIME'a güvenilmez,
 *  - görüntü sharp ile YENİDEN KODLANIR (gömülü kötü amaçlı veri/EXIF/GPS atılır, EXIF yönü uygulanır),
 *  - WebP'ye dönüştürülür (OG: JPEG, favicon/logo: PNG), en uzun kenar 2400px ile sınırlanır,
 *  - güvenli dosya adı üretilir, SVG yalnızca logo/favicon için ve sıkı beyaz liste ile temizlenerek kabul edilir.
 */
export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;
export const MAX_SVG_BYTES = 200 * 1024;

export class UploadError extends Error {}

type Sniffed = "jpeg" | "png" | "webp" | "avif" | "svg";
const MIME_BY_KIND: Record<Sniffed, string> = {
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  avif: "image/avif",
  svg: "image/svg+xml",
};

export function sniffImage(buf: Buffer): Sniffed | null {
  if (buf.length < 12) return null;
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "jpeg";
  if (buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "png";
  if (buf.subarray(0, 4).toString("ascii") === "RIFF" && buf.subarray(8, 12).toString("ascii") === "WEBP") return "webp";
  if (buf.subarray(4, 8).toString("ascii") === "ftyp" && /avif|avis/.test(buf.subarray(8, 16).toString("ascii"))) return "avif";
  const head = buf.subarray(0, 1024).toString("utf8").trimStart();
  if (/^(<\?xml[^>]*\?>\s*)?(<!--[\s\S]*?-->\s*)*(<!DOCTYPE[^>]*>\s*)?<svg[\s>]/i.test(head)) return "svg";
  return null;
}

export type ProcessedUpload = {
  data: Buffer;
  mimeType: string;
  width: number | null;
  height: number | null;
  blurDataUrl: string | null;
  filename: string;
};

export type UploadInput = { name: string; type: string; size: number; arrayBuffer(): Promise<ArrayBuffer> };

function safeFilename(original: string, ext: string): string {
  const base = original.replace(/^.*[\\/]/, "").replace(/\.[^.]*$/, "");
  return `${slugify(base, 60) || "gorsel"}.${ext}`;
}

export async function processUpload(file: UploadInput, purpose: MediaPurpose): Promise<ProcessedUpload> {
  if (file.size <= 0) throw new UploadError("Dosya boş görünüyor.");
  if (file.size > MAX_UPLOAD_BYTES) throw new UploadError("Dosya boyutu en fazla 8 MB olabilir.");

  const input = Buffer.from(await file.arrayBuffer());
  const kind = sniffImage(input);
  if (!kind) throw new UploadError("Yalnızca JPEG, PNG, WebP veya AVIF görselleri yükleyebilirsiniz.");

  const declared = file.type === "image/jpg" ? "image/jpeg" : file.type;
  if (declared && declared !== MIME_BY_KIND[kind]) throw new UploadError("Dosya içeriği, dosya türüyle uyuşmuyor.");

  if (kind === "svg") {
    if (purpose !== "LOGO" && purpose !== "FAVICON") throw new UploadError("SVG dosyaları yalnızca logo ve favicon için kabul edilir.");
    if (input.length > MAX_SVG_BYTES) throw new UploadError("SVG dosyası en fazla 200 KB olabilir.");
    const clean = sanitizeSvg(input.toString("utf8"));
    if (!clean) throw new UploadError("SVG dosyası geçersiz veya güvenli olmayan öğeler içeriyor.");
    const vb = clean.match(/viewBox="([\d.\s-]+)"/)?.[1]?.trim().split(/\s+/).map(Number);
    return {
      data: Buffer.from(clean, "utf8"),
      mimeType: "image/svg+xml",
      width: vb && vb.length === 4 ? Math.round(vb[2]) : null,
      height: vb && vb.length === 4 ? Math.round(vb[3]) : null,
      blurDataUrl: null,
      filename: safeFilename(file.name, "svg"),
    };
  }

  let pipeline: sharp.Sharp;
  try {
    pipeline = sharp(input, { failOn: "error", limitInputPixels: 60_000_000 }).rotate();
  } catch {
    throw new UploadError("Görsel okunamadı.");
  }

  let data: Buffer;
  let mimeType: string;
  let ext: string;
  try {
    if (purpose === "OG") {
      data = await pipeline.resize(1200, 630, { fit: "cover" }).flatten({ background: "#F5F1EA" }).jpeg({ quality: 86, mozjpeg: true }).toBuffer();
      mimeType = "image/jpeg";
      ext = "jpg";
    } else if (purpose === "FAVICON") {
      data = await pipeline.resize(512, 512, { fit: "inside", withoutEnlargement: true }).png({ compressionLevel: 9 }).toBuffer();
      mimeType = "image/png";
      ext = "png";
    } else if (purpose === "LOGO") {
      data = await pipeline.resize({ width: 1600, withoutEnlargement: true }).png({ compressionLevel: 9 }).toBuffer();
      mimeType = "image/png";
      ext = "png";
    } else {
      data = await pipeline.resize({ width: 2400, height: 2400, fit: "inside", withoutEnlargement: true }).webp({ quality: 82 }).toBuffer();
      mimeType = "image/webp";
      ext = "webp";
    }
  } catch {
    throw new UploadError("Görsel işlenemedi. Dosya bozuk olabilir.");
  }

  const meta = await sharp(data).metadata();
  let blurDataUrl: string | null = null;
  if (purpose !== "LOGO" && purpose !== "FAVICON") {
    const tiny = await sharp(data).resize({ width: 16 }).webp({ quality: 35 }).toBuffer();
    blurDataUrl = `data:image/webp;base64,${tiny.toString("base64")}`;
  }

  return {
    data,
    mimeType,
    width: meta.width ?? null,
    height: meta.height ?? null,
    blurDataUrl,
    filename: safeFilename(file.name, ext),
  };
}
