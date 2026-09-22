"use client";

import { sendTestEmailAction } from "@/app/admin/(panel)/sistem/actions";
import { SubmitButton } from "@/components/admin/client";
import { Field, FormFeedback, TextInput } from "@/components/admin/ui";
import { useServerForm } from "@/components/admin/use-server-form";

export function TestEmailForm({ defaultTo, disabled }: { defaultTo: string; disabled: boolean }) {
  const { state, pending, onSubmit } = useServerForm(sendTestEmailAction);
  return (
    <form onSubmit={onSubmit} noValidate className="max-w-md space-y-4">
      <FormFeedback state={state} />
      <Field label="Alıcı" name="to" error={state.fieldErrors?.to}>
        <TextInput name="to" type="email" defaultValue={defaultTo} maxLength={200} error={state.fieldErrors?.to} autoComplete="off" />
      </Field>
      <SubmitButton pending={pending} activeIntent={null} variant="secondary" pendingLabel="Gönderiliyor…" className={disabled ? "pointer-events-none opacity-50" : ""}>
        Test e-postası gönder
      </SubmitButton>
    </form>
  );
}
