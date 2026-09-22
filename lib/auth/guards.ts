import "server-only";
import { redirect } from "next/navigation";
import { getCurrentUser, type SessionUser } from "@/lib/auth/session";
import { ADMIN_LOGIN_PATH } from "@/lib/auth/constants";
import { can, ForbiddenError, type Permission } from "@/lib/permissions";
import type { ActionState } from "@/lib/actions";

/**
 * Veri erişim katmanı (DAL) korumaları. proxy.ts yalnızca "iyimser" bir ön kontrol yapar; asıl doğrulama HER sayfada
 * ve HER server action'da burada, sunucuda ve veritabanı oturumuyla yapılır (CSS/istemci ile gizleme güvenlik sayılmaz).
 */

/** Sayfalar için: oturum yoksa girişe, yetki yoksa panele yönlendirir. */
export async function requireUser(opts: { permission?: Permission; allowMustChangePassword?: boolean } = {}): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) redirect(ADMIN_LOGIN_PATH);
  if (user.mustChangePassword && !opts.allowMustChangePassword) redirect("/admin/hesabim?zorunlu=1");
  if (opts.permission && !can(user.role, opts.permission)) redirect("/admin?yetkisiz=1");
  return user;
}

/** Server action'lar için: oturum yoksa girişe yönlendirir; yetki yoksa hata durumu döndürür. */
export async function guard(
  permission?: Permission,
  opts: { allowMustChangePassword?: boolean } = {},
): Promise<{ ok: true; user: SessionUser } | { ok: false; state: ActionState }> {
  const user = await getCurrentUser();
  if (!user) redirect(ADMIN_LOGIN_PATH);
  if (user.mustChangePassword && !opts.allowMustChangePassword) {
    return { ok: false, state: { status: "error", message: "Devam etmeden önce parolanızı değiştirmeniz gerekiyor." } };
  }
  if (permission && !can(user.role, permission)) {
    return { ok: false, state: { status: "error", message: new ForbiddenError().message } };
  }
  return { ok: true, user };
}
