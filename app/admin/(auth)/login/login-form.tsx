"use client";

import { loginAction } from "@/app/admin/(auth)/login/actions";
import { SubmitButton } from "@/components/admin/client";
import { Field, FormFeedback, TextInput } from "@/components/admin/ui";
import { useServerForm } from "@/components/admin/use-server-form";

export function LoginForm({ next }: { next: string }) {
  const { state, pending, onSubmit } = useServerForm(loginAction);
  return (
    <form onSubmit={onSubmit} className="mt-8 space-y-5" noValidate>
      <input type="hidden" name="next" value={next} />
      <FormFeedback state={state} />
      <Field label="E-posta" name="email" required>
        <TextInput name="email" type="email" autoComplete="username" required maxLength={200} autoFocus />
      </Field>
      <Field label="Parola" name="password" required>
        <TextInput name="password" type="password" autoComplete="current-password" required maxLength={256} />
      </Field>
      <SubmitButton pending={pending} activeIntent={null} pendingLabel="Giriş yapılıyor…" className="w-full !min-h-11">
        Giriş yap
      </SubmitButton>
    </form>
  );
}
