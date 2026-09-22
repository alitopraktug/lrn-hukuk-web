"use client";

import { EditorContent, useEditor, useEditorState } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { TableKit } from "@tiptap/extension-table";
import { Placeholder } from "@tiptap/extensions";
import {
  Bold,
  Heading2,
  Heading3,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Minus,
  Pilcrow,
  Quote,
  Redo2,
  Table as TableIcon,
  Underline as UnderlineIcon,
  Undo2,
  Unlink,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Makale/sayfa editörü (Tiptap). Yalnızca güvenli, beyaz listedeki biçimler sunulur:
 * H2/H3, paragraf, kalın/italik/altı çizili, listeler, alıntı, bağlantı, tablo, yatay çizgi.
 * Çıktı HTML olarak gizli alana yazılır; SUNUCU kaydederken HTML'i ayrıca temizler (sanitize) — editöre güvenilmez.
 */
const btn =
  "inline-flex h-9 min-w-9 items-center justify-center gap-1 rounded-md px-2 text-[0.8rem] font-semibold text-foreground transition-colors hover:bg-forest/10 disabled:opacity-40 aria-pressed:bg-forest aria-pressed:text-background";

function ToolButton({ label, active, disabled, onClick, children }: { label: string; active?: boolean; disabled?: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button type="button" title={label} aria-label={label} aria-pressed={active} disabled={disabled} onMouseDown={(e) => e.preventDefault()} onClick={onClick} className={btn}>
      {children}
    </button>
  );
}

const Sep = () => <span aria-hidden="true" className="mx-1 h-5 w-px bg-line" />;

function normalizeHref(input: string): string | null {
  const v = input.trim();
  if (!v) return null;
  if (/^(https?:\/\/|mailto:|tel:|\/|#)/i.test(v)) return v;
  if (/^[\w.-]+\.[a-z]{2,}(\/.*)?$/i.test(v)) return `https://${v}`;
  return null;
}

export function RichTextEditor({
  name,
  defaultValue = "",
  placeholder = "Metni buraya yazın…",
  minHeightClass = "min-h-[22rem]",
  error,
}: {
  name: string;
  defaultValue?: string;
  placeholder?: string;
  minHeightClass?: string;
  error?: string;
}) {
  const [html, setHtml] = useState(defaultValue);
  const [linkError, setLinkError] = useState("");

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        code: false,
        codeBlock: false,
        strike: false,
        link: { openOnClick: false, autolink: true, defaultProtocol: "https", protocols: ["http", "https", "mailto", "tel"] },
      }),
      TableKit.configure({ table: { resizable: false } }),
      Placeholder.configure({ placeholder }),
    ],
    content: defaultValue,
    editorProps: {
      attributes: { class: cn("prose-lrn px-4 py-3 focus:outline-none sm:px-6 sm:py-5", minHeightClass), "aria-label": "İçerik editörü", role: "textbox", "aria-multiline": "true" },
    },
    onUpdate: ({ editor: e }) => setHtml(e.getHTML()),
  });

  const s = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      p: e?.isActive("paragraph") ?? false,
      h2: e?.isActive("heading", { level: 2 }) ?? false,
      h3: e?.isActive("heading", { level: 3 }) ?? false,
      bold: e?.isActive("bold") ?? false,
      italic: e?.isActive("italic") ?? false,
      underline: e?.isActive("underline") ?? false,
      ul: e?.isActive("bulletList") ?? false,
      ol: e?.isActive("orderedList") ?? false,
      quote: e?.isActive("blockquote") ?? false,
      link: e?.isActive("link") ?? false,
      table: e?.isActive("table") ?? false,
      canUndo: e?.can().undo() ?? false,
      canRedo: e?.can().redo() ?? false,
    }),
  });

  if (!editor || !s) {
    return <div className={cn("rounded-md border border-foreground/25 bg-white", minHeightClass)} aria-busy="true" />;
  }
  const chain = () => editor.chain().focus();

  function setLink() {
    const previous = editor?.getAttributes("link").href as string | undefined;
    const input = window.prompt("Bağlantı adresi (örn. https://…):", previous ?? "https://");
    if (input === null) return;
    if (input.trim() === "") {
      chain().extendMarkRange("link").unsetLink().run();
      setLinkError("");
      return;
    }
    const href = normalizeHref(input);
    if (!href) {
      setLinkError("Geçerli bir bağlantı girin (http://, https://, mailto: veya tel:).");
      return;
    }
    setLinkError("");
    chain().extendMarkRange("link").setLink({ href }).run();
  }

  return (
    <div>
      <div className={cn("overflow-hidden rounded-md border bg-white focus-within:ring-2", error ? "border-danger focus-within:ring-danger/20" : "border-foreground/25 focus-within:border-forest focus-within:ring-forest/20")}>
        <div role="toolbar" aria-label="Biçimlendirme" className="flex flex-wrap items-center gap-0.5 border-b border-line bg-admin/50 px-2 py-1.5">
          <ToolButton label="Paragraf" active={s.p} onClick={() => chain().setParagraph().run()}>
            <Pilcrow size={16} />
          </ToolButton>
          <ToolButton label="Başlık (H2)" active={s.h2} onClick={() => chain().toggleHeading({ level: 2 }).run()}>
            <Heading2 size={17} />
          </ToolButton>
          <ToolButton label="Alt başlık (H3)" active={s.h3} onClick={() => chain().toggleHeading({ level: 3 }).run()}>
            <Heading3 size={17} />
          </ToolButton>
          <Sep />
          <ToolButton label="Kalın" active={s.bold} onClick={() => chain().toggleBold().run()}>
            <Bold size={16} />
          </ToolButton>
          <ToolButton label="İtalik" active={s.italic} onClick={() => chain().toggleItalic().run()}>
            <Italic size={16} />
          </ToolButton>
          <ToolButton label="Altı çizili" active={s.underline} onClick={() => chain().toggleUnderline().run()}>
            <UnderlineIcon size={16} />
          </ToolButton>
          <Sep />
          <ToolButton label="Madde işaretli liste" active={s.ul} onClick={() => chain().toggleBulletList().run()}>
            <List size={17} />
          </ToolButton>
          <ToolButton label="Numaralı liste" active={s.ol} onClick={() => chain().toggleOrderedList().run()}>
            <ListOrdered size={17} />
          </ToolButton>
          <ToolButton label="Alıntı" active={s.quote} onClick={() => chain().toggleBlockquote().run()}>
            <Quote size={16} />
          </ToolButton>
          <Sep />
          <ToolButton label="Bağlantı ekle / düzenle" active={s.link} onClick={setLink}>
            <LinkIcon size={16} />
          </ToolButton>
          <ToolButton label="Bağlantıyı kaldır" disabled={!s.link} onClick={() => chain().extendMarkRange("link").unsetLink().run()}>
            <Unlink size={16} />
          </ToolButton>
          <ToolButton label="Tablo ekle (3×3)" onClick={() => chain().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}>
            <TableIcon size={16} />
          </ToolButton>
          <ToolButton label="Yatay çizgi" onClick={() => chain().setHorizontalRule().run()}>
            <Minus size={16} />
          </ToolButton>
          <Sep />
          <ToolButton label="Geri al" disabled={!s.canUndo} onClick={() => chain().undo().run()}>
            <Undo2 size={16} />
          </ToolButton>
          <ToolButton label="Yinele" disabled={!s.canRedo} onClick={() => chain().redo().run()}>
            <Redo2 size={16} />
          </ToolButton>
        </div>

        {s.table ? (
          <div role="toolbar" aria-label="Tablo işlemleri" className="flex flex-wrap items-center gap-1 border-b border-line bg-forest/5 px-2 py-1.5 text-[0.8rem]">
            <span className="mr-1 font-semibold text-forest-dark">Tablo:</span>
            <button type="button" className={btn} onMouseDown={(e) => e.preventDefault()} onClick={() => chain().addRowAfter().run()}>
              Satır ekle
            </button>
            <button type="button" className={btn} onMouseDown={(e) => e.preventDefault()} onClick={() => chain().addColumnAfter().run()}>
              Sütun ekle
            </button>
            <button type="button" className={btn} onMouseDown={(e) => e.preventDefault()} onClick={() => chain().deleteRow().run()}>
              Satır sil
            </button>
            <button type="button" className={btn} onMouseDown={(e) => e.preventDefault()} onClick={() => chain().deleteColumn().run()}>
              Sütun sil
            </button>
            <button type="button" className={cn(btn, "text-danger")} onMouseDown={(e) => e.preventDefault()} onClick={() => chain().deleteTable().run()}>
              Tabloyu sil
            </button>
          </div>
        ) : null}

        <EditorContent editor={editor} />
      </div>
      {linkError ? (
        <p role="alert" className="mt-1.5 text-[0.85rem] font-medium text-danger">
          {linkError}
        </p>
      ) : null}
      <input type="hidden" name={name} value={html} />
    </div>
  );
}
