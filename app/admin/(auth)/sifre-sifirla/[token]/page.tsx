import Link from "next/link";
import { ResetForm } from "@/app/admin/(auth)/sifre-sifirla/[token]/reset-form";
import { validateResetToken } from "@/lib/auth/reset";

export const metadata = { title: "Parola belirle" };

export default async function ResetPasswordPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const valid = await validateResetToken(token);
  return (
    <>
      <p className="eyebrow">Yönetim Paneli</p>
      <h1 className="mt-4 font-serif text-4xl leading-tight">Yeni parola belirleyin</h1>
      {valid ? (
        <>
          <p className="mt-3 text-quiet">En az 12 karakterli, tahmin edilmesi zor bir parola seçin.</p>
          <ResetForm token={token} />
        </>
      ) : (
        <>
          <p role="alert" className="mt-6 rounded-md border border-danger/40 bg-danger/10 px-4 py-3 text-[0.92rem] text-danger-dark">
            Bu bağlantının süresi dolmuş veya daha önce kullanılmış.
          </p>
          <p className="mt-6 text-[0.9rem]">
            <Link href="/admin/sifremi-unuttum" className="text-forest underline underline-offset-4">
              Yeni bir sıfırlama bağlantısı isteyin
            </Link>
          </p>
        </>
      )}
    </>
  );
}
