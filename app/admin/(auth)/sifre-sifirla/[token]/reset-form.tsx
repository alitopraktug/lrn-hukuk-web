"use client";

import { completeResetAction } from "@/app/admin/(auth)/login/actions";
import { SubmitButton } from "@/components/admin/client";
import { Field, FormFeedback, TextInput } from "@/components/admin/ui";
import { useServerForm } from "@/components/admin/use-server-form";

export function ResetForm({ token }: { token: string }) {
  const { state, pending, onSubmit } = useServerForm(completeResetAction);
  return (
    <form onSubmit={onSubmit} className="mt-8 space-y-5" noValidate>
      <input type="hidden" name="token" value={token} />
      <FormFeedback state={state} />
      <Field label="Yeni parola" name="password" required error={state.fieldErrors?.password} hint="En az 12 karakter.">
        <TextInput name="password" type="password" autoComplete="new-password" required minLength={12} maxLength={128} autoFocus error={state.fieldErrors?.password} />
      </Field>
      <Field label="Yeni parola (tekrar)" name="confirm" required error={state.fieldErrors?.confirm}>
        <TextInput name="confirm" type="password" autoComplete="new-password" required minLength={12} maxLength={128} error={state.fieldErrors?.confirm} />
      </Field>
      <SubmitButton pending={pending} activeIntent={null} pendingLabel="Kaydediliyor…" className="w-full !min-h-11">
        Parolayı kaydet
      </SubmitButton>
    </form>
  );
}
