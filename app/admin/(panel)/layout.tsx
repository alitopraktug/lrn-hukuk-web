import { AdminShell, type NavItem } from "@/components/admin/shell";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth/guards";
import { can, ROLE_LABELS } from "@/lib/permissions";
import { logoutAction } from "@/app/admin/actions";

/**
 * Oturum gerektiren tüm yönetim sayfalarının ortak kabuğu.
 * DİKKAT: Layout'lar gezinmede yeniden çalışmaz; bu yüzden her sayfa ve her Server Action ayrıca requireUser()/guard() çağırır.
 */
export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser({ allowMustChangePassword: true });
  const unread = can(user.role, "message:read") ? await db.contactMessage.count({ where: { read: false } }) : 0;

  const items: (NavItem & { permission?: Parameters<typeof can>[1] })[] = [
    { href: "/admin", label: "Ana Panel", icon: "dashboard" },
    { href: "/admin/yayinlar", label: "Yayınlar", icon: "publications", permission: "publication:manage" },
    { href: "/admin/calisma-alanlari", label: "Çalışma Alanları", icon: "areas", permission: "area:manage" },
    { href: "/admin/ekip", label: "Ekip", icon: "team", permission: "team:manage" },
    { href: "/admin/sayfalar", label: "Sayfalar", icon: "pages", permission: "page:manage" },
    { href: "/admin/mesajlar", label: "İletişim Mesajları", icon: "messages", permission: "message:read", badge: unread },
    { href: "/admin/medya", label: "Medya", icon: "media", permission: "media:manage" },
    { href: "/admin/ayarlar", label: "Site Ayarları", icon: "settings", permission: "settings:manage" },
    { href: "/admin/seo", label: "SEO", icon: "seo", permission: "seo:manage" },
    { href: "/admin/kullanicilar", label: "Kullanıcılar", icon: "users", permission: "user:manage" },
    { href: "/admin/sistem", label: "Sistem ve Yedekleme", icon: "system", permission: "system:view" },
    { href: "/admin/hesabim", label: "Hesabım", icon: "account" },
  ];
  const visible: NavItem[] = items.filter((i) => !i.permission || can(user.role, i.permission)).map(({ permission: _p, ...rest }) => rest);

  return (
    <AdminShell items={visible} user={{ name: user.name, email: user.email, roleLabel: ROLE_LABELS[user.role] }} logout={logoutAction}>
      {children}
    </AdminShell>
  );
}
