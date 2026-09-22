"use client";

/** Kök düzen hata verirse devreye giren son çare sayfası (kendi html/body'sini içerir; stil bağımlılığı yoktur). */
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="tr">
      <body style={{ margin: 0, background: "#f5f1ea", color: "#252524", fontFamily: "Georgia, serif" }}>
        <div style={{ maxWidth: 640, margin: "0 auto", padding: "18vh 24px" }}>
          <h1 style={{ fontSize: 40, fontWeight: 400, margin: 0 }}>Bir sorun oluştu.</h1>
          <p style={{ fontFamily: "system-ui, sans-serif", lineHeight: 1.6, marginTop: 20 }}>
            Sayfa şu anda görüntülenemiyor. Lütfen tekrar deneyin.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{ marginTop: 24, padding: "12px 24px", background: "#1e3b26", color: "#f5f1ea", border: 0, cursor: "pointer", fontFamily: "system-ui, sans-serif" }}
          >
            Tekrar dene
          </button>
        </div>
      </body>
    </html>
  );
}
