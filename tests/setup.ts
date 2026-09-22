/**
 * Test ortamı: gerçek sırlar kullanılmaz. Entegrasyon testleri ayrı bir TEST veritabanı gerektirir:
 *   DATABASE_URL_TEST=postgresql://lrn:lrn@localhost:5432/lrn_hukuk_test   (varsayılan)
 * Veritabanına erişilemezse entegrasyon testleri atlanır (birim testleri yine çalışır).
 */
process.env.AUTH_SECRET = "test-secret-test-secret-test-secret-1234567890";
process.env.NEXT_PUBLIC_SITE_URL = "https://www.example.test";
process.env.DATABASE_URL = process.env.DATABASE_URL_TEST ?? "postgresql://lrn:lrn@localhost:5432/lrn_hukuk_test";
(process.env as Record<string, string>).NODE_ENV = "test";
delete process.env.SMTP_HOST;
delete process.env.CONTACT_TO_EMAIL;
delete process.env.TURNSTILE_SECRET_KEY;
delete process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
