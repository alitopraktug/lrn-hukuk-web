import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import "./globals.css";

/**
 * Yazı tipleri build sırasında indirilip site ile birlikte sunulur (self-host): ziyaretçi tarayıcısı Google'a istek atmaz.
 * latin-ext alt kümesi Türkçe karakterler (ğ ş ı İ ö ü ç) için gereklidir.
 */
const serif = Cormorant_Garamond({
  subsets: ["latin", "latin-ext"],
  weight: "400",
  style: "normal",
  variable: "--font-cormorant",
  display: "swap",
});

// İtalik yalnızca vurgu kelimelerinde ve alıntılarda kullanılır; ilk boyamayı geciktirmesin diye ön yüklenmez.
const serifItalic = Cormorant_Garamond({
  subsets: ["latin", "latin-ext"],
  weight: "400",
  style: "italic",
  variable: "--font-cormorant-italic",
  display: "swap",
  preload: false,
});

const sans = Manrope({
  subsets: ["latin", "latin-ext"],
  variable: "--font-manrope",
  display: "swap",
});

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/+$/, "");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "LRN Hukuk | Ankara", template: "%s | LRN Hukuk" },
  applicationName: "LRN Hukuk",
  formatDetection: { telephone: false, email: false, address: false },
};

export const viewport: Viewport = {
  themeColor: "#f5f1ea",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Not: <html lang> kasıtlı olarak sabit "tr" kalır (headers()/cookies() kullanmak bu kökteki her sayfayı
  // dinamik render'a zorlar ve ISR'ı kırar). /en altındaki gerçek dil işareti, o alt ağacı saran bir
  // <div lang="en"> ile verilir (bkz. components/layout/public-shell.tsx) — ekran okuyucu ve CSS
  // text-transform (TR "i" → "İ" büyütmesi) için yeterlidir; yalnızca kök <html> etiketi "tr" kalır.
  return (
    <html lang="tr" className={`${serif.variable} ${serifItalic.variable} ${sans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
