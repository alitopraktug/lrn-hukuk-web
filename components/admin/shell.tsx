"use client";

import {
  Briefcase,
  Database,
  ExternalLink,
  FileText,
  ImageIcon,
  KeyRound,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  Search,
  Settings,
  UserCircle,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

const ICONS: Record<string, LucideIcon> = {
  dashboard: LayoutDashboard,
  publications: FileText,
  areas: Briefcase,
  team: Users,
  pages: FileText,
  messages: Mail,
  settings: Settings,
  seo: Search,
  users: KeyRound,
  media: ImageIcon,
  system: Database,
  account: UserCircle,
};

export type NavItem = { href: string; label: string; icon: keyof typeof ICONS; badge?: number };

function isActive(pathname: string, href: string) {
  return href === "/admin" ? pathname === "/admin" : pathname === href || pathname.startsWith(`${href}/`);
}

function NavList({ items, pathname, onNavigate }: { items: NavItem[]; pathname: string; onNavigate?: () => void }) {
  return (
    <ul className="space-y-0.5">
      {items.map((item) => {
        const Icon = ICONS[item.icon];
        const active = isActive(pathname, item.href);
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2.5 text-[0.92rem] font-medium transition-colors",
                active ? "bg-background/12 text-white" : "text-background/70 hover:bg-background/8 hover:text-white",
              )}
            >
              <Icon size={18} aria-hidden="true" className="shrink-0" />
              <span className="flex-1">{item.label}</span>
              {item.badge ? <span className="rounded-full bg-wine px-2 py-0.5 text-[0.7rem] font-bold text-white">{item.badge}</span> : null}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function SidebarBody({
  items,
  user,
  logout,
  pathname,
  onNavigate,
}: {
  items: NavItem[];
  user: { name: string; email: string; roleLabel: string };
  logout: () => Promise<void>;
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <>
      <div className="px-5 pb-4 pt-6">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/logo-horizontal-light.svg" alt="LRN Hukuk" width={160} height={39} className="h-9 w-auto" />
        <p className="mt-3 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-background/50">Yönetim Paneli</p>
      </div>
      <nav aria-label="Yönetim menüsü" className="flex-1 overflow-y-auto px-3 py-2">
        <NavList items={items} pathname={pathname} onNavigate={onNavigate} />
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 flex items-center gap-3 rounded-md px-3 py-2.5 text-[0.92rem] font-medium text-background/70 transition-colors hover:bg-background/8 hover:text-white"
        >
          <ExternalLink size={18} aria-hidden="true" />
          Siteyi görüntüle
        </a>
      </nav>
      <div className="border-t border-background/10 p-4">
        <p className="truncate text-[0.9rem] font-semibold text-white">{user.name}</p>
        <p className="truncate text-[0.8rem] text-background/55">
          {user.email} · {user.roleLabel}
        </p>
        <form action={logout} className="mt-3">
          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-md border border-background/20 px-3 py-2 text-[0.88rem] font-semibold text-background/85 transition-colors hover:bg-background/10"
          >
            <LogOut size={16} aria-hidden="true" />
            Çıkış
          </button>
        </form>
      </div>
    </>
  );
}

export function AdminShell({
  items,
  user,
  logout,
  children,
}: {
  items: NavItem[];
  user: { name: string; email: string; roleLabel: string };
  logout: () => Promise<void>;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    dialogRef.current?.close();
  }, [pathname]);

  return (
    <div className="min-h-screen bg-admin text-foreground lg:grid lg:grid-cols-[16.5rem_minmax(0,1fr)]" style={{ scrollbarGutter: "auto" }}>
      <a href="#admin-icerik" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[70] focus:rounded-md focus:bg-forest focus:px-4 focus:py-2 focus:text-background">
        İçeriğe geç
      </a>

      <aside className="on-dark sticky top-0 hidden h-screen flex-col bg-ink lg:flex">
        <SidebarBody items={items} user={user} logout={logout} pathname={pathname} />
      </aside>

      <div className="min-w-0">
        <header className="on-dark sticky top-0 z-30 flex h-14 items-center justify-between bg-ink px-4 text-background lg:hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/logo-horizontal-light.svg" alt="LRN Hukuk – Yönetim Paneli" width={120} height={29} className="h-7 w-auto" />
          <button
            type="button"
            onClick={() => dialogRef.current?.showModal()}
            aria-haspopup="dialog"
            className="-mr-2 flex h-11 items-center gap-2 px-2 text-[0.85rem] font-semibold"
          >
            <Menu size={20} aria-hidden="true" />
            Menü
          </button>
        </header>

        <dialog
          ref={dialogRef}
          aria-label="Yönetim menüsü"
          className="on-dark m-0 h-dvh max-h-none w-[min(20rem,88vw)] max-w-none flex-col bg-ink p-0 text-background backdrop:bg-ink/60 open:flex"
          onClick={(e) => {
            if (e.target === dialogRef.current) dialogRef.current?.close();
          }}
        >
          <button type="button" onClick={() => dialogRef.current?.close()} className="absolute right-2 top-3 flex h-11 w-11 items-center justify-center text-background/80" aria-label="Menüyü kapat">
            <X size={20} aria-hidden="true" />
          </button>
          <SidebarBody items={items} user={user} logout={logout} pathname={pathname} onNavigate={() => dialogRef.current?.close()} />
        </dialog>

        <main id="admin-icerik" tabIndex={-1} className="mx-auto w-full max-w-6xl px-4 py-8 outline-none sm:px-8 lg:py-10">
          {children}
        </main>
      </div>
    </div>
  );
}
