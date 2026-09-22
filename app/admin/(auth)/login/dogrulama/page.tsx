import { redirect } from "next/navigation";
import { TwoFactorForm } from "@/app/admin/(auth)/login/dogrulama/two-factor-form";
import { getPendingUser } from "@/lib/auth/session";
import { safeNextPath } from "@/lib/auth/constants";

export const metadata = { title: "İki adımlı doğrulama" };

export default async function TwoFactorPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const sp = await searchParams;
  if (!(await getPendingUser())) redirect("/admin/login");
  return (
    <>
      <p className="eyebrow">İki adımlı doğrulama</p>
      <h1 className="mt-4 font-serif text-4xl leading-tight">Doğrulama kodu</h1>
      <p className="mt-3 text-quiet">Kimlik doğrulama uygulamanızdaki 6 haneli kodu girin. Uygulamaya erişemiyorsanız kurtarma kodlarınızdan birini kullanabilirsiniz.</p>
      <TwoFactorForm next={safeNextPath(sp.next)} />
    </>
  );
}
