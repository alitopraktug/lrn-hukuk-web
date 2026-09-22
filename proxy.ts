import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_LOGIN_PATH, isPublicAdminPath, isSecureSite, sessionCookieName } from "@/lib/auth/constants";

/**
 * Next.js 16 "proxy" (eski adıyla middleware). Yalnızca ucuz, İYİMSER ön kontroller yapar:
 *  1. Ters vekil arkasında http → https yönlendirmesi (site https ise),
 *  2. (İsteğe bağlı) kanonik alan adına yönlendirme — ENFORCE_CANONICAL_HOST=true,
 *  3. /admin altında oturum çerezi hiç yoksa girişe yönlendirme.
 * Bu, güvenlik sınırı DEĞİLDİR: oturumun gerçekten geçerli olup olmadığı her sayfada ve her Server Action'da
 * sunucu tarafında, veritabanı oturumuyla doğrulanır (lib/auth/guards.ts).
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const secure = isSecureSite(siteUrl);
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? "";

  // 1) HTTP → HTTPS
  if (secure && request.headers.get("x-forwarded-proto") === "http") {
    return NextResponse.redirect(`https://${host}${pathname}${search}`, 308);
  }

  // 2) Kanonik alan adı (www / www'siz tekilleştirme)
  if (process.env.ENFORCE_CANONICAL_HOST === "true" && siteUrl) {
    try {
      const canonical = new URL(siteUrl);
      if (host && host !== canonical.host && !/^(localhost|127\.0\.0\.1)/.test(host)) {
        return NextResponse.redirect(`${canonical.origin}${pathname}${search}`, 308);
      }
    } catch {
      /* geçersiz NEXT_PUBLIC_SITE_URL — yönlendirme yapma */
    }
  }

  // 3) Yönetim paneli: oturum çerezi yoksa girişe
  if ((pathname === "/admin" || pathname.startsWith("/admin/")) && !isPublicAdminPath(pathname)) {
    const hasSession = Boolean(request.cookies.get(sessionCookieName(secure))?.value);
    if (!hasSession) {
      const url = request.nextUrl.clone();
      url.pathname = ADMIN_LOGIN_PATH;
      url.search = "";
      if (pathname !== "/admin") url.searchParams.set("next", `${pathname}${search}`);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  // Statik dosyalar, görseller ve uzantılı yollar (sitemap.xml, robots.txt, favicon…) proxy'den geçmez.
  matcher: ["/((?!_next/static|_next/image|brand/|media/|.*\\..*).*)"],
};
