import { describe, expect, it } from "vitest";
import { isValidSlug, slugify, uniqueSlug } from "@/lib/slug";
import { htmlToText, normalizeForSearch, readingMinutes, singleLine, splitLines, truncate } from "@/lib/text";
import { splitEmphasis } from "@/lib/utils";

describe("slugify", () => {
  it("Türkçe karakterleri ASCII'ye çevirir", () => {
    expect(slugify("İş ve Sosyal Güvenlik Hukuku")).toBe("is-ve-sosyal-guvenlik-hukuku");
    expect(slugify("Şirketler Hukuku")).toBe("sirketler-hukuku");
    expect(slugify("ĞÜŞİÖÇ ığüşöç")).toBe("gusioc-igusoc");
  });

  it("küçük harf, URL-güvenli ve tekrarlayan tireleri sadeleştirir", () => {
    expect(slugify("  Merhaba,   Dünya!!  ")).toBe("merhaba-dunya");
    expect(slugify("A & B")).toBe("a-ve-b");
    expect(slugify("---")).toBe("");
  });

  it("uzun başlıkları kelime sınırında keser", () => {
    const s = slugify("Bir iki üç dört beş altı yedi sekiz dokuz on ".repeat(6), 40);
    expect(s.length).toBeLessThanOrEqual(40);
    expect(s.endsWith("-")).toBe(false);
  });

  it("isValidSlug yalnızca güvenli sluglara izin verir", () => {
    expect(isValidSlug("is-sozlesmesi")).toBe(true);
    expect(isValidSlug("Is-Sozlesmesi")).toBe(false);
    expect(isValidSlug("../etc/passwd")).toBe(false);
    expect(isValidSlug("a--b")).toBe(false);
  });

  it("çakışmada -2, -3 son eki ekler", async () => {
    const taken = new Set(["ceza-hukuku", "ceza-hukuku-2"]);
    expect(await uniqueSlug("Ceza Hukuku", async (s) => taken.has(s))).toBe("ceza-hukuku-3");
    expect(await uniqueSlug("Yeni Yazı", async (s) => taken.has(s))).toBe("yeni-yazi");
  });
});

describe("metin yardımcıları", () => {
  it("normalizeForSearch Türkçe karakterleri sadeleştirir (I/ı/İ/i dahil)", () => {
    expect(normalizeForSearch("İŞÇİ Hakları")).toBe("isci haklari");
    expect(normalizeForSearch("ISPARTA ığdır")).toBe("isparta igdir");
  });

  it("htmlToText etiketleri ve varlıkları çözer", () => {
    expect(htmlToText("<p>Merhaba <strong>dünya</strong> &amp; &lt;tag&gt;</p>")).toBe("Merhaba dünya & <tag>");
  });

  it("readingMinutes en az 1 dakika, ~200 kelime/dk", () => {
    expect(readingMinutes("<p>kısa</p>")).toBe(1);
    expect(readingMinutes(`<p>${"kelime ".repeat(450)}</p>`)).toBe(3);
  });

  it("singleLine kontrol karakterlerini ve satır sonlarını temizler (başlık enjeksiyonu)", () => {
    expect(singleLine("Merhaba\r\nBcc: kotu@ornek.com")).toBe("Merhaba Bcc: kotu@ornek.com");
    expect(singleLine("a" + String.fromCharCode(0x2028) + "b")).toBe("a b");
  });

  it("splitLines boş satırları atar", () => {
    expect(splitLines("a\n\n  b  \r\nc")).toEqual(["a", "b", "c"]);
  });

  it("truncate kelime sınırında keser", () => {
    expect(truncate("bir iki üç dört beş", 12)).toMatch(/…$/);
    expect(truncate("kısa", 12)).toBe("kısa");
  });

  it("splitEmphasis *vurgu* işaretini güvenli parçalara ayırır", () => {
    expect(splitEmphasis("Açık *iletişim* ve özen")).toEqual([
      { text: "Açık ", em: false },
      { text: "iletişim", em: true },
      { text: " ve özen", em: false },
    ]);
    // HTML enjekte edilemez: etiketler düz metin olarak kalır
    expect(splitEmphasis("<img src=x onerror=alert(1)>")).toEqual([{ text: "<img src=x onerror=alert(1)>", em: false }]);
  });
});
