"use client";

import { useState } from "react";
import {
  changePasswordAction,
  disableTwoFactorAction,
  enableTwoFactorAction,
  regenerateRecoveryCodesAction,
  type EnableTwoFactorState,
} from "@/app/admin/(panel)/hesabim/actions";
import { SubmitButton } from "@/components/admin/client";
import { Alert, Field, FormFeedback, TextInput } from "@/components/admin/ui";
import { useServerForm } from "@/components/admin/use-server-form";

export function PasswordForm() {
  const { state, pending, onSubmit } = useServerForm(changePasswordAction);
  const e = state.fieldErrors ?? {};
  return (
    <form onSubmit={onSubmit} noValidate className="max-w-md space-y-5">
      <FormFeedback state={state} />
      <Field label="Mevcut parola" name="current" required error={e.current}>
        <TextInput name="current" type="password" autoComplete="current-password" required error={e.current} />
      </Field>
      <Field label="Yeni parola" name="password" required error={e.password} hint="En az 12 karakter. Uzun bir cümle güvenli ve akılda kalıcı bir seçimdir.">
        <TextInput name="password" type="password" autoComplete="new-password" required minLength={12} maxLength={128} error={e.password} />
      </Field>
      <Field label="Yeni parola (tekrar)" name="confirm" required error={e.confirm}>
        <TextInput name="confirm" type="password" autoComplete="new-password" required minLength={12} maxLength={128} error={e.confirm} />
      </Field>
      <SubmitButton pending={pending} activeIntent={null} pendingLabel="Değiştiriliyor…">
        Parolayı değiştir
      </SubmitButton>
    </form>
  );
}

function RecoveryCodes({ codes }: { codes: string[] }) {
  return (
    <Alert tone="warning" className="mt-4">
      <p className="font-semibold">Kurtarma kodlarınız — bu kodlar bir daha gösterilmeyecek.</p>
      <p className="mt-1 text-[0.88rem]">Güvenli bir yere (örn. parola yöneticisi) kaydedin. Her kod yalnızca bir kez kullanılabilir; telefonunuza erişemezseniz girişte kullanın.</p>
      <ul className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1 font-mono text-[0.95rem] sm:grid-cols-4">
        {codes.map((c) => (
          <li key={c}>{c}</li>
        ))}
      </ul>
    </Alert>
  );
}

export function EnableTwoFactorForm() {
  const { state, pending, onSubmit } = useServerForm(enableTwoFactorAction as never);
  const s = state as EnableTwoFactorState;
  const e = s.fieldErrors ?? {};
  if (s.status === "success" && s.recoveryCodes) {
    return (
      <div>
        <Alert tone="success">İki adımlı doğrulama açıldı.</Alert>
        <RecoveryCodes codes={s.recoveryCodes} />
      </div>
    );
  }
  return (
    <form onSubmit={onSubmit} noValidate className="max-w-sm space-y-4">
      <FormFeedback state={state} />
      <Field label="Uygulamadaki 6 haneli kod" name="code" required error={e.code}>
        <TextInput name="code" inputMode="numeric" autoComplete="one-time-code" required maxLength={8} error={e.code} className="text-lg tracking-widest" />
      </Field>
      <SubmitButton pending={pending} activeIntent={null} pendingLabel="Doğrulanıyor…">
        Doğrula ve aç
      </SubmitButton>
    </form>
  );
}

export function DisableTwoFactorForm() {
  const { state, pending, onSubmit } = useServerForm(disableTwoFactorAction);
  const e = state.fieldErrors ?? {};
  return (
    <form onSubmit={onSubmit} noValidate className="max-w-sm space-y-4">
      <FormFeedback state={state} />
      <Field label="Onay için parolanız" name="password" required error={e.password}>
        <TextInput name="password" type="password" autoComplete="current-password" required error={e.password} />
      </Field>
      <SubmitButton pending={pending} activeIntent={null} variant="danger" pendingLabel="Kapatılıyor…">
        İki adımlı doğrulamayı kapat
      </SubmitButton>
    </form>
  );
}

export function RegenerateCodesForm() {
  const { state, pending, onSubmit } = useServerForm(regenerateRecoveryCodesAction as never);
  const s = state as EnableTwoFactorState;
  const [open, setOpen] = useState(false);
  const e = s.fieldErrors ?? {};
  if (s.status === "success" && s.recoveryCodes) return <RecoveryCodes codes={s.recoveryCodes} />;
  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="text-[0.9rem] font-semibold text-forest hover:underline">
        Kurtarma kodlarını yeniden oluştur
      </button>
    );
  }
  return (
    <form onSubmit={onSubmit} noValidate className="max-w-sm space-y-4">
      <FormFeedback state={state} />
      <Field label="Onay için parolanız" name="password" required error={e.password}>
        <TextInput name="password" type="password" autoComplete="current-password" required error={e.password} />
      </Field>
      <SubmitButton pending={pending} activeIntent={null} variant="secondary" pendingLabel="Oluşturuluyor…">
        Yeni kodlar oluştur
      </SubmitButton>
    </form>
  );
}
