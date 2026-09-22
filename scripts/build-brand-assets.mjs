#!/usr/bin/env node
/**
 * public/brand/ içindeki logo SVG'lerinden favicon, uygulama ikonları ve varsayılan OG görselini üretir.
 *
 *   npm run brand:icons
 *
 * Nihai logo hazır olduğunda:
 *   1. public/brand/logo.svg, logo-horizontal.svg, logo-mark.svg (ve -light varyantlarını) değiştirin,
 *   2. bu komutu çalıştırın.
 * Üretilenler: icon.svg, favicon.ico, apple-touch-icon.png, icon-192.png, icon-512.png, og-default.png
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const dir = path.resolve(process.cwd(), "public/brand");
const read = (f) => fs.readFileSync(path.join(dir, f), "utf8");
const BG = "#F5F1EA";

const inner = (svg) => svg.replace(/^[\s\S]*?<svg[^>]*>/, "").replace(/<\/svg>\s*$/, "").replace(/<title>[\s\S]*?<\/title>/, "");
const viewBox = (svg) => svg.match(/viewBox="([^"]+)"/)[1].split(/\s+/).map(Number);

// ── Simge (mark, ivory zemin üzerinde) ──────────────────────────────────────
const mark = read("logo-mark.svg");
const [mx, my, mw, mh] = viewBox(mark);
function iconSvg({ size = 64, radius = 12, pad = 0.2 }) {
  const box = size * (1 - pad * 2);
  const s = Math.min(box / mw, box / mh);
  const tx = (size - mw * s) / 2 - mx * s;
  const ty = (size - mh * s) / 2 - my * s;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}"><rect width="${size}" height="${size}" rx="${radius}" fill="${BG}"/><g transform="translate(${tx} ${ty}) scale(${s})">${inner(mark)}</g></svg>`;
}
fs.writeFileSync(path.join(dir, "icon.svg"), iconSvg({ size: 64, radius: 12, pad: 0.16 }));

const png = (svg, size) => sharp(Buffer.from(svg), { density: 384 }).resize(size, size).png().toBuffer();

// favicon.ico (PNG gömülü ICO: 16, 32, 48)
const sizes = [16, 32, 48];
const pngs = await Promise.all(sizes.map((s) => png(iconSvg({ size: 128, radius: 24, pad: 0.12 }), s)));
const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(sizes.length, 4);
let offset = 6 + 16 * sizes.length;
const entries = pngs.map((buf, i) => {
  const e = Buffer.alloc(16);
  e.writeUInt8(sizes[i] === 256 ? 0 : sizes[i], 0);
  e.writeUInt8(sizes[i] === 256 ? 0 : sizes[i], 1);
  e.writeUInt8(0, 2);
  e.writeUInt8(0, 3);
  e.writeUInt16LE(1, 4);
  e.writeUInt16LE(32, 6);
  e.writeUInt32LE(buf.length, 8);
  e.writeUInt32LE(offset, 12);
  offset += buf.length;
  return e;
});
fs.writeFileSync(path.join(dir, "favicon.ico"), Buffer.concat([header, ...entries, ...pngs]));

// Apple touch icon (iOS köşeleri kendisi yuvarlar) ve PWA ikonları
fs.writeFileSync(path.join(dir, "apple-touch-icon.png"), await png(iconSvg({ size: 180, radius: 0, pad: 0.2 }), 180));
fs.writeFileSync(path.join(dir, "icon-192.png"), await png(iconSvg({ size: 192, radius: 0, pad: 0.2 }), 192));
fs.writeFileSync(path.join(dir, "icon-512.png"), await png(iconSvg({ size: 512, radius: 0, pad: 0.2 }), 512));

// ── Varsayılan Open Graph görseli (1200×630) ─────────────────────────────────
const stacked = read("logo.svg");
const [sx, sy, sw, sh] = viewBox(stacked);
const targetH = 330;
const targetW = (sw / sh) * targetH;
const og = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="${BG}"/>
  <rect x="28" y="28" width="1144" height="574" fill="none" stroke="#252524" stroke-opacity="0.16" stroke-width="1"/>
  <svg x="${(1200 - targetW) / 2}" y="${(630 - targetH) / 2}" width="${targetW}" height="${targetH}" viewBox="${sx} ${sy} ${sw} ${sh}">${inner(stacked)}</svg>
</svg>`;
await sharp(Buffer.from(og), { density: 192 }).resize(1200, 630).png({ compressionLevel: 9 }).toFile(path.join(dir, "og-default.png"));

console.log("Marka dosyaları üretildi:", fs.readdirSync(dir).join(", "));
