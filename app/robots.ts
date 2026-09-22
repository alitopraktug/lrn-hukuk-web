import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/env";

/**
 * /admin ve /api dizine alınmaz (ayrıca /admin yanıtlarında X-Robots-Tag: noindex başlığı vardır).
 * Taslak/önizleme yalnızca /admin altında sunulduğundan herkese açık bir "taslak" rotası yoktur.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/admin/", "/api/"] }],
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
