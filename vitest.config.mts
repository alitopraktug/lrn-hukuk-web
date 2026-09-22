import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "."),
      // `server-only` paketi Next dışında hata fırlatır; testlerde boş modülle değiştirilir.
      "server-only": path.resolve(import.meta.dirname, "tests/stubs/server-only.ts"),
    },
  },
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    setupFiles: ["tests/setup.ts"],
    testTimeout: 30_000,
    hookTimeout: 60_000,
    // Entegrasyon testleri aynı veritabanını paylaşır → dosyalar sırayla çalışır.
    fileParallelism: false,
  },
});
