import { z } from "zod";

/**
 * Server action'lar için ortak durum tipi ve form yardımcıları.
 * Dosya "use server" içermez; yalnızca tipler ve saf yardımcılar barındırır (istemci bileşenleri de import edebilir).
 */
export type ActionState = {
  status: "idle" | "success" | "error";
  message?: string;
  /** Alan adı → ilk hata mesajı */
  fieldErrors?: Record<string, string>;
  /** Formun yeniden doldurulması gerekirse (örn. sunucu doğrulaması başarısız) */
  values?: Record<string, string>;
};

export const idleState: ActionState = { status: "idle" };

export const errorState = (message: string, fieldErrors?: Record<string, string>): ActionState => ({
  status: "error",
  message,
  fieldErrors,
});

export const successState = (message: string): ActionState => ({ status: "success", message });

/** FormData → düz nesne. Tekrarlanan anahtarlar (checkbox grupları) dizi olur. */
export function formToObject(fd: FormData): Record<string, string | string[]> {
  const out: Record<string, string | string[]> = {};
  for (const key of new Set(fd.keys())) {
    const all = fd.getAll(key).filter((v): v is string => typeof v === "string");
    out[key] = all.length > 1 ? all : (all[0] ?? "");
  }
  return out;
}

export function zodFieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.map(String).join(".") || "_";
    if (!(key in out)) out[key] = issue.message;
  }
  return out;
}

/** Şemaya göre FormData'yı doğrular; hatada Türkçe alan hatalarıyla ActionState döndürür. */
export function parseForm<S extends z.ZodType>(
  schema: S,
  fd: FormData,
): { ok: true; data: z.output<S> } | { ok: false; state: ActionState } {
  const raw = formToObject(fd);
  const result = schema.safeParse(raw);
  if (result.success) return { ok: true, data: result.data };
  const fieldErrors = zodFieldErrors(result.error);
  return {
    ok: false,
    state: { status: "error", message: "Lütfen işaretli alanları kontrol edin.", fieldErrors },
  };
}
