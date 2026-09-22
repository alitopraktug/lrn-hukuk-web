# LRN Hukuk — Docker imajı (VPS / kendi sunucunuz için).
#
# Uygulama, sayfaları derlerken veritabanını okur; bu yüzden `next build` imaj içinde değil, konteyner AÇILIRKEN
# (veritabanı hazır olduktan sonra) çalıştırılır. Derleme sonucu `next_build` birimine (volume) yazılır; sonraki
# yeniden başlatmalarda tekrar derlenmez. İmaj yeniden oluşturulunca (`docker compose up -d --build`) derleme
# damgası değiştiği için uygulama otomatik olarak yeniden derlenir.
FROM node:22-bookworm-slim

WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

COPY package.json package-lock.json ./
COPY prisma ./prisma
COPY prisma.config.ts ./
RUN npm ci

COPY . .
RUN npx prisma generate && date +%s > /app/.image-stamp

COPY deploy/docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

ENV NODE_ENV=production
EXPOSE 3000
ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["npm", "run", "start", "--", "-p", "3000"]
