"use client";

import { Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Alert, btnClass } from "@/components/admin/ui";
import { cn } from "@/lib/utils";

export function UploadPanel() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ tone: "success" | "error"; text: string } | null>(null);

  async function upload(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true);
    setMessage(null);
    let ok = 0;
    let lastError = "";
    for (const file of Array.from(files)) {
      const fd = new FormData();
      fd.set("file", file);
      fd.set("purpose", "GENERAL");
      const res = await fetch("/admin/api/media", { method: "POST", body: fd });
      if (res.ok) ok++;
      else lastError = ((await res.json().catch(() => ({}))) as { error?: string }).error ?? "Yükleme başarısız.";
    }
    setBusy(false);
    setMessage(lastError ? { tone: "error", text: `${ok} görsel yüklendi. Hata: ${lastError}` } : { tone: "success", text: `${ok} görsel yüklendi.` });
    router.refresh();
  }

  return (
    <div>
      <label className={cn(btnClass.primary, "cursor-pointer", busy && "pointer-events-none opacity-60")}>
        <Upload size={16} aria-hidden="true" />
        {busy ? "Yükleniyor…" : "Görsel yükle"}
        <input type="file" multiple accept="image/jpeg,image/png,image/webp,image/avif" className="sr-only" onChange={(e) => void upload(e.target.files)} />
      </label>
      <span className="ml-3 text-[0.82rem] text-quiet">JPEG, PNG, WebP veya AVIF · en fazla 8 MB</span>
      {message ? (
        <Alert tone={message.tone} className="mt-4">
          {message.text}
        </Alert>
      ) : null}
    </div>
  );
}
