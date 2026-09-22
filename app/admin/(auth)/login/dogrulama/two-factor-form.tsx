"use client";

import { cancelTwoFactorAction, verifyTwoFactorAction } from "@/app/admin/(auth)/login/actions";
import { SubmitButton } from "@/components/admin/client";
import { Field, FormFeedback, TextInput, btnClass } from "@/components/admin/ui";
import { useServerForm } from "@/components/admin/use-server-form";

export function TwoFactorForm({ next }: { next: string }) {
  const { state, pending, onSubmit } = useServerForm(verifyTwoFactorAction);
  return (
    <div className="mt-8">
      <form onSubmit={onSubmit} className="space-y-5" noValidate>
        <input type="hidden" name="next" value={next} />
        <FormFeedback state={state} />
        <Field label="Doğrulama kodu veya kurtarma kodu" name="code" required>
          <TextInput name="code" inputMode="text" autoComplete="one-time-code" required maxLength={32} autoFocus className="text-lg tracking-widest" />
        </Field>
        <SubmitButton pending={pending} activeIntent={null} pendingLabel="Doğrulanıyor…" className="w-full !min-h-11">
          Doğrula
        </SubmitButton>
      </form>
      <form action={cancelTwoFactorAction} className="mt-4">
        <button type="submit" className={btnClass.ghost}>
          Vazgeç ve girişe dön
        </button>
      </form>
    </div>
  );
}
