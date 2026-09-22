import Link from "next/link";
import { ForgotForm } from "@/app/admin/(auth)/sifremi-unuttum/forgot-form";

export const metadata = { title: "Parolamı unuttum" };

export default function ForgotPasswordPage() {
  return (
    <>
      <p className="eyebrow">Yönetim Paneli</p>
      <h1 className="mt-4 font-serif text-4xl leading-tight">Parolamı unuttum</h1>
      <p className="mt-3 text-quiet">E-posta adresinizi girin; kayıtlıysa parola sıfırlama bağlantısı gönderilir.</p>
      <ForgotForm />
      <p className="mt-6 text-[0.9rem]">
        <Link href="/admin/login" className="text-forest underline underline-offset-4">
          Girişe dön
        </Link>
      </p>
    </>
  );
}
