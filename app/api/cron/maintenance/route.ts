import { timingSafeEqual } from "node:crypto";
import { db } from "@/lib/db";
import { env } from "@/lib/env";
import { runMaintenance } from "@/lib/maintenance";

export const dynamic = "force-dynamic";

/**
 * Bakım rotası (Vercel Cron veya harici cron). CRON_SECRET tanımlı değilse rota KAPALIDIR.
 * Çağrı: Authorization: Bearer <CRON_SECRET> (Vercel bunu otomatik ekler).
 */
async function handle(request: Request) {
  const secret = env.cronSecret;
  const header = request.headers.get("authorization") ?? "";
  const expected = `Bearer ${secret ?? ""}`;
  const ok = Boolean(secret) && header.length === expected.length && timingSafeEqual(Buffer.from(header), Buffer.from(expected));
  if (!ok) return new Response("Unauthorized", { status: 401 });
  return Response.json({ ok: true, result: await runMaintenance(db) }, { headers: { "Cache-Control": "no-store" } });
}

export const GET = handle;
export const POST = handle;
