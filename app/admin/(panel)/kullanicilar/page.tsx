import { CreateUserForm, EditUserForm, ResetPasswordButton } from "@/app/admin/(panel)/kullanicilar/users-client";
import { resetUserTwoFactorAction } from "@/app/admin/(panel)/kullanicilar/actions";
import { ConfirmForm } from "@/components/admin/client";
import { Alert, Badge, Card, PageHeader } from "@/components/admin/ui";
import { requireUser } from "@/lib/auth/guards";
import { db } from "@/lib/db";
import { ROLE_LABELS } from "@/lib/permissions";
import { formatDateTime } from "@/lib/utils";

export const metadata = { title: "Kullanıcılar" };

export default async function UsersPage() {
  const me = await requireUser({ permission: "user:manage" });
  const users = await db.user.findMany({ orderBy: [{ active: "desc" }, { createdAt: "asc" }], select: { id: true, email: true, name: true, role: true, active: true, totpEnabled: true, lastLoginAt: true, mustChangePassword: true, lockedUntil: true } });

  return (
    <>
      <PageHeader title="Kullanıcılar" description="Panele erişebilen kişiler. Genel bir kayıt sayfası yoktur; hesapları yalnızca yöneticiler oluşturur." />
      <Alert tone="info" className="mb-6">
        <strong>Roller:</strong> <em>Yönetici</em> her şeyi yapabilir. <em>Editör</em> yalnızca yayınları ve medyayı yönetebilir; ekip, ayarlar, kullanıcılar, mesajlar ve sistem bölümlerine erişemez.
      </Alert>

      <Card title="Yeni kullanıcı" className="mb-6">
        <CreateUserForm />
      </Card>

      <div className="space-y-4">
        {users.map((u) => (
          <Card key={u.id}>
            <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-bold">{u.email}</p>
                <p className="mt-0.5 text-[0.82rem] text-quiet">{u.lastLoginAt ? `Son giriş: ${formatDateTime(u.lastLoginAt)}` : "Henüz giriş yapmadı"}</p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <Badge tone={u.role === "ADMIN" ? "blue" : "gray"}>{ROLE_LABELS[u.role]}</Badge>
                {!u.active ? <Badge tone="red">Pasif</Badge> : null}
                {u.totpEnabled ? <Badge tone="green">2FA açık</Badge> : <Badge tone="gray">2FA kapalı</Badge>}
                {u.mustChangePassword ? <Badge tone="amber">Parola değiştirmeli</Badge> : null}
                {u.lockedUntil && u.lockedUntil > new Date() ? <Badge tone="red">Geçici kilitli</Badge> : null}
              </div>
            </div>
            <EditUserForm id={u.id} name={u.name} role={u.role} active={u.active} isSelf={u.id === me.id} />
            <div className="mt-4 flex flex-wrap items-start gap-x-6 gap-y-2 border-t border-line pt-4">
              <ResetPasswordButton id={u.id} />
              {u.totpEnabled ? (
                <ConfirmForm action={resetUserTwoFactorAction} hidden={{ id: u.id }} title="İki adımlı doğrulama sıfırlansın mı?" message={<>{u.email} için 2FA kapatılır (telefonunu kaybettiyse gereklidir). Kullanıcı isterse yeniden kurabilir.</>} confirmLabel="Evet, sıfırla" variant="ghost">
                  2FA’yı sıfırla
                </ConfirmForm>
              ) : null}
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}
