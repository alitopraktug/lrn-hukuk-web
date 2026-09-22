"use client";

import { requestResetAction } from "@/app/admin/(auth)/login/actions";
import { SubmitButton } from "@/components/admin/client";
import { Field, FormFeedback, TextInput } from "@/components/admin/ui";
import { useServerForm } from "@/components/admin/use-server-form";

export function ForgotForm() {
  const { state, pending, onSubmit } = useServerForm(requestResetAction);
  return (
    <form onSubmit={onSubmit} className="mt-8 space-y-5" noValidate>
      <FormFeedback state={state} />
      {state.status !== "success" ? (
        <>
          <Field label="E-posta" name="email" required>
            <TextInput name="email" type="email" autoComplete="email" required maxLength={200} autoFocus />
          </Field>
          <SubmitButton pending={pending} activeIntent={null} pendingLabel="Gönderiliyor…" className="w-full !min-h-11">
            Sıfırlama bağlantısı gönder
          </SubmitButton>
        </>
      ) : null}
    </form>
  );
}
