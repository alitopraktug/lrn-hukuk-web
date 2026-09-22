import QRCode from "qrcode";
import { DisableTwoFactorForm, EnableTwoFactorForm, PasswordForm, RegenerateCodesForm } from "@/app/admin/(panel)/hesabim/account-forms";
import { signOutOthersAction, startTwoFactorSetupAction } from "@/app/admin/(panel)/hesabim/actions";
import { Alert, Badge, Card, PageHeader, btnClass } from "@/components/admin/ui";
import { requireUser } from "@/lib/auth/guards";
import { decryptSecret } from "@/lib/auth/crypto";
import { otpauthUri } from "@/lib/auth/totp";
import { db } from "@/lib/db";
import { ROLE_LABELS } from "@/lib/permissions";
import { formatDateTime } from "@/lib/utils";

export const metadata = { title: "Hesabım" };

export default async function AccountPage({ searchParams }: { searchParams: Promise<{ zorunlu?: string }> }) {
  const user = await requireUser({ allowMustChangePassword: true });
  const sp = await searchParams;
  const record = await db.user.findUniqueOrThrow({
    where: { id: user.id },
    select: { totpEnabled: true, totpSecret: true, recoveryCodes: true, lastLoginAt: true, sessions: { where: { twoFactorPending: false, expiresAt: { gt: new Date() } }, orderBy: { lastSeenAt: "desc" }, select: { id: true, ip: true, userAgent: true, lastSeenAt: true } } },
  });

  let setup: { secret: string; qr: string } | null = null;
  if (!record.totpEnabled && record.totpSecret) {
    const secret = decryptSecret(record.totpSecret);
    const qr = await QRCode.toDataURL(otpauthUri({ secret, account: user.email, issuer: "LRN Hukuk" }), { margin: 1, width: 200, errorCorrectionLevel: "M" });
    setup = { secret, qr };
  }

  return (
    <>
      <PageHeader title="Hesabım" description={`${user.name} · ${user.email} · ${ROLE_LABELS[user.role]}`} />

      {sp.zorunlu || user.mustChangePassword ? (
        <Alert tone="warning" className="mb-6">
          Güvenliğiniz için devam etmeden önce geçici parolanızı değiştirmeniz gerekiyor.
        </Alert>
      ) : null}

      <div className="space-y-6">
        <Card title="Parola değiştir" description="Değişiklikten sonra diğer cihazlardaki oturumlarınız kapatılır.">
          <PasswordForm />
        </Card>

        <Card
          title="İki adımlı doğrulama (2FA)"
          description="Parolanıza ek olarak telefondaki bir doğrulama uygulamasının (Google Authenticator, Microsoft Authenticator, 1Password vb.) kodunu ister. Üretim ortamında önerilir."
          actions={record.totpEnabled ? <Badge tone="green">Açık</Badge> : <Badge tone="gray">Kapalı</Badge>}
        >
          {record.totpEnabled ? (
            <div className="space-y-6">
              <p className="text-[0.92rem] text-quiet">{record.recoveryCodes.length} kullanılmamış kurtarma kodunuz var.</p>
              <RegenerateCodesForm />
              <div className="border-t border-line pt-6">
                <DisableTwoFactorForm />
              </div>
            </div>
          ) : setup ? (
            <div className="grid gap-6 md:grid-cols-[13.5rem_1fr]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={setup.qr} alt="İki adımlı doğrulama için QR kodu" width={200} height={200} className="rounded-lg border border-line bg-white p-2" />
              <div>
                <ol className="list-decimal space-y-1.5 pl-5 text-[0.92rem]">
                  <li>Telefonunuzda bir doğrulama uygulaması açın.</li>
                  <li>QR kodu okutun (veya aşağıdaki anahtarı elle girin).</li>
                  <li>Uygulamadaki 6 haneli kodu aşağıya yazın.</li>
                </ol>
                <p className="mt-3 text-[0.85rem] text-quiet">
                  Elle giriş anahtarı: <code className="break-all rounded bg-admin px-1.5 py-0.5 font-mono text-[0.85rem] text-foreground">{setup.secret}</code>
                </p>
                <div className="mt-5">
                  <EnableTwoFactorForm />
                </div>
              </div>
            </div>
          ) : (
            <form action={startTwoFactorSetupAction}>
              <button className={btnClass.primary}>Kurulumu başlat</button>
            </form>
          )}
        </Card>

        <Card title="Açık oturumlar" description={record.lastLoginAt ? `Son giriş: ${formatDateTime(record.lastLoginAt)}` : undefined}>
          <ul className="divide-y divide-line text-[0.9rem]">
            {record.sessions.map((s) => (
              <li key={s.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5">
                <span className="min-w-0 truncate">
                  {(s.userAgent ?? "Bilinmeyen tarayıcı").slice(0, 70)}
                  {s.id === user.sessionId ? <Badge tone="green"> Bu oturum</Badge> : null}
                </span>
                <span className="text-quiet">
                  {s.ip ?? "—"} · {formatDateTime(s.lastSeenAt)}
                </span>
              </li>
            ))}
          </ul>
          {record.sessions.length > 1 ? (
            <form action={signOutOthersAction} className="mt-4">
              <button className={btnClass.secondary}>Diğer tüm oturumları kapat</button>
            </form>
          ) : null}
        </Card>
      </div>
    </>
  );
}
