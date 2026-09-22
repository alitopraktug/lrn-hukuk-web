"use client";

import { ImageIcon, Trash2, Upload } from "lucide-react";
import { useId, useRef, useState } from "react";
import { btnClass, inputClass } from "@/components/admin/ui";
import { cn } from "@/lib/utils";

export type PickedMedia = { id: string; alt: string; width: number | null; height: number | null; filename?: string };
type LibraryItem = PickedMedia & { purpose: string; mimeType: string };

/**
 * Görsel seçici: kütüphaneden seç veya yeni yükle. Seçilen medya kimliği gizli alanda (name) gönderilir;
 * alt metin `${name}Alt` alanında gönderilir ve kayıt sırasında görselin alt metnini günceller.
 * Yükleme, /admin/api/media üzerinden (oturum + Origin doğrulamalı) yapılır; sunucu dosyayı doğrulayıp optimize eder.
 */
export function ImageField({
  name,
  label,
  purpose = "GENERAL",
  initial,
  hint,
  aspect = "aspect-[4/3]",
  error,
}: {
  name: string;
  label: string;
  purpose?: "GENERAL" | "PHOTO" | "COVER" | "OG" | "LOGO" | "FAVICON";
  initial?: PickedMedia | null;
  hint?: string;
  aspect?: string;
  error?: string;
}) {
  const uid = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [media, setMedia] = useState<PickedMedia | null>(initial ?? null);
  const [items, setItems] = useState<LibraryItem[] | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  async function loadLibrary() {
    try {
      const res = await fetch(`/admin/api/media?purpose=${purpose}`, { cache: "no-store" });
      if (!res.ok) throw new Error();
      setItems((await res.json()).items as LibraryItem[]);
    } catch {
      setItems([]);
      setMessage("Kütüphane yüklenemedi.");
    }
  }

  function open() {
    setMessage("");
    dialogRef.current?.showModal();
    void loadLibrary();
  }

  function pick(m: PickedMedia) {
    setMedia(m);
    dialogRef.current?.close();
  }

  async function upload(file: File) {
    setUploading(true);
    setMessage("");
    try {
      const fd = new FormData();
      fd.set("file", file);
      fd.set("purpose", purpose);
      const res = await fetch("/admin/api/media", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Yükleme başarısız.");
      pick(json.media as PickedMedia);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Yükleme başarısız.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <p className="mb-1.5 text-[0.85rem] font-semibold" id={`${uid}-label`}>
        {label}
      </p>
      <input type="hidden" name={name} value={media?.id ?? ""} />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className={cn("relative w-full max-w-[14rem] shrink-0 overflow-hidden rounded-lg border border-line bg-admin", aspect)}>
          {media ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={`/media/${media.id}`} alt={media.alt || "Seçilen görsel"} className="absolute inset-0 h-full w-full object-contain" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-quiet">
              <ImageIcon size={28} aria-hidden="true" />
              <span className="sr-only">Görsel seçilmedi</span>
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={open} className={btnClass.secondary} aria-describedby={`${uid}-label`}>
              <ImageIcon size={16} aria-hidden="true" />
              {media ? "Görseli değiştir" : "Görsel seç veya yükle"}
            </button>
            {media ? (
              <button type="button" onClick={() => setMedia(null)} className={btnClass.dangerGhost}>
                <Trash2 size={16} aria-hidden="true" />
                Kaldır
              </button>
            ) : null}
          </div>
          {media ? (
            <div>
              <label htmlFor={`${uid}-alt`} className="mb-1 block text-[0.82rem] font-semibold">
                Alternatif metin (görseli görmeyenler için kısa açıklama)
              </label>
              <input key={media.id} id={`${uid}-alt`} name={`${name}Alt`} defaultValue={media.alt} maxLength={200} className={inputClass} />
            </div>
          ) : null}
          {hint ? <p className="text-[0.82rem] text-quiet">{hint}</p> : null}
          {error ? <p className="text-[0.85rem] font-medium text-danger">{error}</p> : null}
        </div>
      </div>

      <dialog
        ref={dialogRef}
        aria-labelledby={`${uid}-dlg`}
        className="m-auto max-h-[90vh] w-[min(94vw,52rem)] overflow-hidden rounded-xl border border-line bg-white p-0 text-foreground shadow-soft backdrop:bg-ink/50"
        onClick={(e) => {
          if (e.target === dialogRef.current) dialogRef.current?.close();
        }}
      >
        <div className="flex max-h-[90vh] flex-col">
          <div className="flex items-center justify-between gap-4 border-b border-line px-5 py-4">
            <h2 id={`${uid}-dlg`} className="font-sans text-lg font-bold">
              Görsel seç
            </h2>
            <button type="button" className={btnClass.secondary} onClick={() => dialogRef.current?.close()}>
              Kapat
            </button>
          </div>
          <div className="overflow-y-auto p-5">
            <label className={cn(btnClass.primary, "cursor-pointer", uploading && "pointer-events-none opacity-60")}>
              <Upload size={16} aria-hidden="true" />
              {uploading ? "Yükleniyor…" : "Bilgisayardan yükle"}
              <input
                type="file"
                accept={purpose === "LOGO" || purpose === "FAVICON" ? "image/jpeg,image/png,image/webp,image/avif,image/svg+xml" : "image/jpeg,image/png,image/webp,image/avif"}
                className="sr-only"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void upload(f);
                  e.target.value = "";
                }}
              />
            </label>
            <span className="ml-3 text-[0.82rem] text-quiet">JPEG, PNG, WebP veya AVIF · en fazla 8 MB · otomatik optimize edilir</span>
            {message ? (
              <p role="alert" className="mt-3 text-[0.9rem] font-medium text-danger">
                {message}
              </p>
            ) : null}

            <h3 className="mb-3 mt-6 font-sans text-[0.9rem] font-bold">Kütüphane</h3>
            {items === null ? (
              <p className="text-quiet">Yükleniyor…</p>
            ) : items.length === 0 ? (
              <p className="text-quiet">Henüz görsel yok. Yukarıdan bir görsel yükleyin.</p>
            ) : (
              <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {items.map((m) => (
                  <li key={m.id}>
                    <button type="button" onClick={() => pick(m)} className="group block w-full overflow-hidden rounded-lg border border-line text-left hover:border-forest focus-visible:border-forest">
                      <span className="relative block aspect-square bg-admin">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={`/media/${m.id}`} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-contain" />
                      </span>
                      <span className="block truncate px-2 py-1.5 text-[0.78rem] text-quiet group-hover:text-foreground">{m.filename || m.id}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </dialog>
    </div>
  );
}
