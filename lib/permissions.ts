/**
 * Rol tabanlı erişim. Şimdilik ADMIN ve EDITOR vardır; yeni rol eklemek için yalnızca bu tabloya satır eklemek yeterlidir.
 *  - ADMIN: her şey.
 *  - EDITOR: yayınları (ve medyayı) yönetir; ekip, ayarlar, kullanıcılar, mesajlar ve sistem ayarlarını değiştiremez.
 */
export type Role = "ADMIN" | "EDITOR";

export const PERMISSIONS = {
  "publication:manage": ["ADMIN", "EDITOR"],
  "media:manage": ["ADMIN", "EDITOR"],
  "area:manage": ["ADMIN"],
  "team:manage": ["ADMIN"],
  "page:manage": ["ADMIN"],
  "message:read": ["ADMIN"],
  "settings:manage": ["ADMIN"],
  "seo:manage": ["ADMIN"],
  "user:manage": ["ADMIN"],
  "system:view": ["ADMIN"],
} as const satisfies Record<string, readonly Role[]>;

export type Permission = keyof typeof PERMISSIONS;

export function can(role: Role | undefined | null, permission: Permission): boolean {
  if (!role) return false;
  return (PERMISSIONS[permission] as readonly Role[]).includes(role);
}

export const ROLE_LABELS: Record<Role, string> = {
  ADMIN: "Yönetici",
  EDITOR: "Editör",
};

export class ForbiddenError extends Error {
  constructor(message = "Bu işlem için yetkiniz bulunmuyor.") {
    super(message);
    this.name = "ForbiddenError";
  }
}
