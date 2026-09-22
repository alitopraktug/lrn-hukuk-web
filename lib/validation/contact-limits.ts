/** İletişim formu alan sınırları — istemci paketine Zod çekmemek için şemadan ayrı, bağımlılıksız dosya. */
export const CONTACT_LIMITS = { name: 100, email: 200, phone: 30, subject: 150, message: 4000 } as const;
