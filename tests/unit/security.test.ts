import { describe, expect, it } from "vitest";
import { decryptSecret, encryptSecret, keyedHash, safeEqual, sha256 } from "@/lib/auth/crypto";
import { hashPassword, needsRehash, passwordPolicyError, verifyPassword } from "@/lib/auth/password";
import { base32Decode, base32Encode, generateRecoveryCodes, hotp, totpAt, verifyTotp } from "@/lib/auth/totp";
import { isPublicAdminPath, safeNextPath, sessionCookieName } from "@/lib/auth/constants";
import { prepareRichText, sanitizeRichText, sanitizeSvg } from "@/lib/richtext";
import { can } from "@/lib/permissions";
import { safeMapEmbedUrl } from "@/lib/map";
import { sniffImage } from "@/lib/media/process";

describe("parola", () => {
  it("hash doğrular, yanlış parolayı reddeder, her hash farklı tuz kullanır", async () => {
    const a = await hashPassword("Doğru-Parola-2026");
    const b = await hashPassword("Doğru-Parola-2026");
    expect(a).not.toBe(b);
    expect(a.startsWith("scrypt$")).toBe(true);
    expect(await verifyPassword("Doğru-Parola-2026", a)).toBe(true);
    expect(await verifyPassword("yanlis-parola-2026", a)).toBe(false);
    expect(await verifyPassword("x", "bozuk-hash")).toBe(false);
    expect(needsRehash(a)).toBe(false);
    expect(needsRehash("scrypt$1024$8$1$aa$bb")).toBe(true);
  }, 30_000);

  it("parola politikası uzunluk ve yaygın parolaları denetler", () => {
    expect(passwordPolicyError("kisa")).toMatch(/12/);
    expect(passwordPolicyError("aaaaaaaaaaaaaaaa")).toBeTruthy();
    expect(passwordPolicyError("password1234")).toBeTruthy();
    expect(passwordPolicyError("ali.veli.2026", { email: "ali.veli@ornek.com" })).toMatch(/e-posta/);
    expect(passwordPolicyError("Uzun-ve-guclu-bir-parola-42")).toBeNull();
  });
});

describe("TOTP (RFC 6238)", () => {
  // RFC 6238 Ek B: SHA1, anahtar "12345678901234567890"
  const secret = base32Encode(Buffer.from("12345678901234567890"));

  it("RFC test vektörlerini üretir", () => {
    expect(hotp(base32Decode(secret), Math.floor(59 / 30), 8)).toBe("94287082");
    expect(hotp(base32Decode(secret), Math.floor(1111111109 / 30), 8)).toBe("07081804");
    expect(totpAt(secret, 59_000)).toBe("287082");
  });

  it("base32 gidiş-dönüş tutarlıdır", () => {
    const buf = Buffer.from([1, 2, 3, 250, 251, 252, 253, 254, 255, 0, 7]);
    expect(base32Decode(base32Encode(buf))).toEqual(buf);
  });

  it("doğru kodu kabul eder, ±1 adım toleransı vardır, yanlış/eski kodu reddeder", () => {
    const now = 1_700_000_000_000;
    const code = totpAt(secret, now);
    expect(verifyTotp(secret, code, { timeMs: now })).toMatchObject({ ok: true });
    expect(verifyTotp(secret, code, { timeMs: now + 30_000 })).toMatchObject({ ok: true }); // 1 adım sonra
    expect(verifyTotp(secret, code, { timeMs: now + 120_000 })).toEqual({ ok: false });
    expect(verifyTotp(secret, "000000", { timeMs: now })).toEqual({ ok: false });
    expect(verifyTotp(secret, "12345", { timeMs: now })).toEqual({ ok: false });
  });

  it("aynı adımdaki kodun yeniden kullanılmasını (replay) engeller", () => {
    const now = 1_700_000_000_000;
    const code = totpAt(secret, now);
    const first = verifyTotp(secret, code, { timeMs: now });
    expect(first.ok).toBe(true);
    if (first.ok) expect(verifyTotp(secret, code, { timeMs: now, lastUsedStep: first.step })).toEqual({ ok: false });
  });

  it("kurtarma kodları benzersiz ve biçimlidir", () => {
    const codes = generateRecoveryCodes(8);
    expect(new Set(codes).size).toBe(8);
    for (const c of codes) expect(c).toMatch(/^[a-z2-9]{4}-[a-z2-9]{4}-[a-z2-9]{4}$/);
  });
});

describe("kripto yardımcıları", () => {
  it("AES-GCM şifreleme geri döner ve kurcalamayı fark eder", () => {
    const enc = encryptSecret("JBSWY3DPEHPK3PXP");
    expect(enc).not.toContain("JBSWY3DP");
    expect(decryptSecret(enc)).toBe("JBSWY3DPEHPK3PXP");
    const parts = enc.split(".");
    parts[3] = Buffer.from("tampered").toString("base64url");
    expect(() => decryptSecret(parts.join("."))).toThrow();
  });

  it("keyedHash deterministik ama amaca özeldir; safeEqual zamanlama güvenlidir", () => {
    expect(keyedHash("a", "x")).toBe(keyedHash("a", "x"));
    expect(keyedHash("a", "x")).not.toBe(keyedHash("b", "x"));
    expect(sha256("abc")).toHaveLength(64);
    expect(safeEqual("abc", "abc")).toBe(true);
    expect(safeEqual("abc", "abd")).toBe(false);
    expect(safeEqual("abc", "abcd")).toBe(false);
  });
});

describe("oturum sabitleri ve yönlendirme güvenliği", () => {
  it("https sitede __Host- önekli çerez adı kullanılır", () => {
    expect(sessionCookieName(true)).toBe("__Host-lrn_session");
    expect(sessionCookieName(false)).toBe("lrn_session");
  });

  it("safeNextPath açık yönlendirmeyi engeller", () => {
    expect(safeNextPath("/admin/yayinlar")).toBe("/admin/yayinlar");
    expect(safeNextPath("https://kotu.example")).toBe("/admin");
    expect(safeNextPath("//kotu.example")).toBe("/admin");
    expect(safeNextPath("/admin\\..\\x")).toBe("/admin");
    expect(safeNextPath("/admin\r\nSet-Cookie: x=1")).toBe("/admin");
    expect(safeNextPath("/admin/login")).toBe("/admin");
    expect(safeNextPath(undefined)).toBe("/admin");
  });

  it("yalnızca giriş/sıfırlama yolları oturumsuz erişilebilir", () => {
    expect(isPublicAdminPath("/admin/login")).toBe(true);
    expect(isPublicAdminPath("/admin/login/dogrulama")).toBe(true);
    expect(isPublicAdminPath("/admin/sifremi-unuttum")).toBe(true);
    expect(isPublicAdminPath("/admin/sifre-sifirla/abc")).toBe(true);
    expect(isPublicAdminPath("/admin")).toBe(false);
    expect(isPublicAdminPath("/admin/yayinlar")).toBe(false);
    expect(isPublicAdminPath("/admin/loginx")).toBe(false);
  });
});

describe("roller", () => {
  it("EDITOR yalnızca yayın ve medya yönetebilir; ADMIN her şeyi", () => {
    expect(can("EDITOR", "publication:manage")).toBe(true);
    expect(can("EDITOR", "media:manage")).toBe(true);
    for (const p of ["settings:manage", "user:manage", "team:manage", "area:manage", "message:read", "system:view", "page:manage", "seo:manage"] as const) {
      expect(can("EDITOR", p)).toBe(false);
      expect(can("ADMIN", p)).toBe(true);
    }
    expect(can(null, "publication:manage")).toBe(false);
  });
});

describe("zengin metin güvenliği (XSS)", () => {
  const attacks = [
    '<script>alert(1)</script><p>x</p>',
    '<img src=x onerror=alert(1)>',
    '<a href="javascript:alert(1)">tıkla</a>',
    '<p onclick="alert(1)">x</p>',
    '<iframe src="https://kotu.example"></iframe>',
    '<svg onload=alert(1)></svg>',
    '<style>body{display:none}</style><p>x</p>',
    '<a href="data:text/html;base64,PHNjcmlwdD4=">x</a>',
    '<form action="https://kotu.example"><input name=a></form>',
    '<p style="position:fixed">x</p>',
  ];

  it.each(attacks)("tehlikeli girdiyi temizler: %s", (html) => {
    const clean = sanitizeRichText(html);
    expect(clean).not.toMatch(/<script|onerror|onclick|onload|javascript:|<iframe|<style|<form|<input|<svg|style=|data:text/i);
  });

  it("izinli biçimleri korur, harici bağlantılara güvenli rel ekler", () => {
    const clean = sanitizeRichText('<h1>Başlık</h1><p><strong>k</strong> <a href="https://ornek.com" target="_self">bağ</a></p><ul><li>a</li></ul><table><tbody><tr><td>1</td></tr></tbody></table>');
    expect(clean).toContain("<h2>Başlık</h2>");
    expect(clean).toContain('rel="noopener noreferrer"');
    expect(clean).toContain('target="_blank"');
    expect(clean).toContain("<table>");
  });

  it("prepareRichText başlıklara benzersiz id ekler ve tabloları kaydırılabilir kapsayıcıya alır", () => {
    const { html, headings } = prepareRichText("<h2>Süreler</h2><p>a</p><h2>Süreler</h2><h3>Alt</h3><table><tbody><tr><td>x</td></tr></tbody></table>");
    expect(headings.map((h) => h.id)).toEqual(["sureler", "sureler-2", "alt"]);
    expect(html).toContain('id="sureler-2"');
    expect(html).toContain('class="table-scroll"');
  });

  it("SVG: betik ve dış bağlantılar atılır", () => {
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10" onload="alert(1)"><script>alert(1)</script><path d="M0 0h10"/><foreignObject><div>x</div></foreignObject><use href="https://kotu.example/x.svg#a"/></svg>';
    const clean = sanitizeSvg(svg);
    expect(clean).toBeTruthy();
    expect(clean).not.toMatch(/script|onload|foreignObject|kotu\.example/i);
    expect(clean).toContain("<path");
    expect(sanitizeSvg("<html><body>svg değil</body></html>")).toBeNull();
  });
});

describe("harita ve dosya doğrulama", () => {
  it("yalnızca bilinen sağlayıcıların embed adreslerini kabul eder", () => {
    expect(safeMapEmbedUrl("https://www.google.com/maps/embed?pb=!1m18")).toBeTruthy();
    expect(safeMapEmbedUrl("https://www.openstreetmap.org/export/embed.html?bbox=1,2,3,4")).toBeTruthy();
    expect(safeMapEmbedUrl("https://kotu.example/maps/embed")).toBeNull();
    expect(safeMapEmbedUrl("http://www.google.com/maps/embed?pb=1")).toBeNull();
    expect(safeMapEmbedUrl("javascript:alert(1)")).toBeNull();
    expect(safeMapEmbedUrl("https://www.google.com/search?q=x")).toBeNull();
    expect(safeMapEmbedUrl("")).toBeNull();
  });

  it("sniffImage gerçek içeriğe bakar (bildirilen türe değil)", () => {
    const png = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0]);
    const jpg = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0, 0x10, 0x4a, 0x46, 0x49, 0x46, 0, 1]);
    const webp = Buffer.concat([Buffer.from("RIFF"), Buffer.from([0, 0, 0, 0]), Buffer.from("WEBPVP8 ")]);
    expect(sniffImage(png)).toBe("png");
    expect(sniffImage(jpg)).toBe("jpeg");
    expect(sniffImage(webp)).toBe("webp");
    expect(sniffImage(Buffer.from('<?xml version="1.0"?><svg xmlns="http://www.w3.org/2000/svg"></svg>'))).toBe("svg");
    expect(sniffImage(Buffer.from("MZ\x90\x00\x03\x00\x00\x00\x04\x00\x00\x00\xff\xff"))).toBeNull(); // .exe
    expect(sniffImage(Buffer.from("<html><script>alert(1)</script></html>"))).toBeNull();
  });
});
