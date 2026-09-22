#!/bin/sh
set -e

echo "[lrn-hukuk] Veritabanı migrasyonları uygulanıyor…"
npx prisma migrate deploy

# Derleme, imaj her yenilendiğinde (docker compose up -d --build) yeniden yapılır; aksi halde önbellekten açılır.
if [ ! -f .next/BUILD_ID ] || ! cmp -s /app/.image-stamp .next/.image-stamp 2>/dev/null; then
  echo "[lrn-hukuk] Uygulama derleniyor (1–2 dakika sürebilir)…"
  rm -rf .next/* .next/.[!.]* 2>/dev/null || true
  npm run build
  cp /app/.image-stamp .next/.image-stamp
fi

echo "[lrn-hukuk] Sunucu başlatılıyor."
exec "$@"
