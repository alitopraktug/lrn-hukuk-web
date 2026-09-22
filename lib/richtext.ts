import sanitizeHtml from "sanitize-html";
import { slugify } from "@/lib/slug";
import { htmlToText } from "@/lib/text";

/**
 * Zengin metin (Tiptap çıktısı) güvenliği.
 * - Kayıt sırasında `sanitizeRichText` ile beyaz liste dışındaki her şey atılır.
 * - Gösterirken `prepareRichText` tekrar sanitize eder (savunma katmanı) ve H2/H3 başlıklarına id ekler.
 * Ham HTML hiçbir zaman doğrudan render edilmez.
 */

const ALLOWED_TAGS = [
  "h2",
  "h3",
  "p",
  "br",
  "strong",
  "em",
  "u",
  "ul",
  "ol",
  "li",
  "blockquote",
  "a",
  "table",
  "thead",
  "tbody",
  "tr",
  "th",
  "td",
  "hr",
];

function isExternal(href: string): boolean {
  return /^https?:\/\//i.test(href);
}

export function sanitizeRichText(html: string): string {
  return sanitizeHtml(html ?? "", {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: {
      a: ["href", "title", "target", "rel"],
      th: ["colspan", "rowspan"],
      td: ["colspan", "rowspan"],
    },
    allowedSchemes: ["http", "https", "mailto", "tel"],
    allowedSchemesAppliedToAttributes: ["href"],
    allowProtocolRelative: false,
    disallowedTagsMode: "discard",
    transformTags: {
      b: "strong",
      i: "em",
      h1: "h2",
      h4: "h3",
      h5: "h3",
      h6: "h3",
      a: (tagName, attribs) => {
        const href = (attribs.href ?? "").trim();
        const next: Record<string, string> = { href };
        if (attribs.title) next.title = attribs.title;
        if (isExternal(href)) {
          next.target = "_blank";
          next.rel = "noopener noreferrer";
        }
        return { tagName: "a", attribs: next };
      },
    },
  }).trim();
}

export type Heading = { id: string; text: string; level: 2 | 3 };

export function prepareRichText(html: string): { html: string; headings: Heading[]; text: string } {
  const clean = sanitizeRichText(html);
  const used = new Map<string, number>();
  const headings: Heading[] = [];

  let out = clean.replace(/<h([23])>([\s\S]*?)<\/h\1>/g, (_m, level: string, inner: string) => {
    const text = htmlToText(inner);
    let id = slugify(text, 60) || "baslik";
    const n = (used.get(id) ?? 0) + 1;
    used.set(id, n);
    if (n > 1) id = `${id}-${n}`;
    headings.push({ id, text, level: Number(level) as 2 | 3 });
    return `<h${level} id="${id}">${inner}</h${level}>`;
  });

  // Geniş tabloların mobilde taşmaması için kaydırılabilir kapsayıcı.
  out = out.replace(/<table>/g, '<div class="table-scroll" tabindex="0"><table>').replace(/<\/table>/g, "</table></div>");

  return { html: out, headings, text: htmlToText(clean) };
}

/** SVG logo/favicon yüklemeleri için sıkı beyaz liste (script, foreignObject, dış bağlantı yok). */
export function sanitizeSvg(svg: string): string | null {
  const cleaned = sanitizeHtml(svg, {
    allowedTags: [
      "svg",
      "g",
      "path",
      "circle",
      "ellipse",
      "rect",
      "line",
      "polyline",
      "polygon",
      "defs",
      "linearGradient",
      "radialGradient",
      "stop",
      "clipPath",
      "mask",
      "title",
      "desc",
      "symbol",
      "use",
    ],
    allowedAttributes: {
      "*": [
        "id",
        "class",
        "fill",
        "fill-rule",
        "clip-rule",
        "fill-opacity",
        "stroke",
        "stroke-width",
        "stroke-linecap",
        "stroke-linejoin",
        "stroke-miterlimit",
        "stroke-opacity",
        "opacity",
        "transform",
        "d",
        "cx",
        "cy",
        "r",
        "rx",
        "ry",
        "x",
        "y",
        "x1",
        "x2",
        "y1",
        "y2",
        "width",
        "height",
        "points",
        "offset",
        "stop-color",
        "stop-opacity",
        "gradientUnits",
        "gradientTransform",
        "clip-path",
        "mask",
        "viewBox",
        "xmlns",
        "preserveAspectRatio",
        "role",
        "aria-label",
      ],
      use: ["href", "x", "y", "width", "height"],
    },
    allowedSchemes: [],
    allowedSchemesAppliedToAttributes: [],
    parser: { lowerCaseTags: false, lowerCaseAttributeNames: false, xmlMode: true },
    // <use href="#id"> dışındaki tüm href'ler atılır
    exclusiveFilter: (frame) => frame.tag === "use" && !/^#[\w-]+$/.test(frame.attribs.href ?? ""),
  }).trim();
  if (!/^<svg[\s>]/i.test(cleaned)) return null;
  return cleaned;
}
