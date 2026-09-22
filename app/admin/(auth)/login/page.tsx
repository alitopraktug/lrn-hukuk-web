import Link from "next/link";
import { redirect } from "next/navigation";
import { LoginForm } from "@/app/admin/(auth)/login/login-form";
import { getCurrentUser } from "@/lib/auth/session";
import { safeNextPath } from "@/lib/auth/constants";

export const metadata = { title: "Giriş" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; sifirlandi?: string }> }) {
  const sp = await searchParams;
  const next = safeNextPath(sp.next);
  if (await getCurrentUser()) redirect(next);

  return (
    <>
      <p className="eyebrow">Yönetim Paneli</p>
      <h1 className="mt-4 font-serif text-4xl leading-tight">Giriş yapın</h1>
      <p className="mt-3 text-quiet">Devam etmek için yetkili hesabınızla oturum açın.</p>
      {sp.sifirlandi ? (
        <p role="status" className="mt-6 rounded-md border border-forest/40 bg-forest/10 px-4 py-3 text-[0.92rem] text-forest-dark">
          Parolanız güncellendi. Yeni parolanızla giriş yapabilirsiniz.
        </p>
      ) : null}
      <LoginForm next={next} />
      <p className="mt-6 text-[0.9rem]">
        <Link href="/admin/sifremi-unuttum" className="text-forest underline underline-offset-4">
          Parolamı unuttum
        </Link>
      </p>
    </>
  );
}
