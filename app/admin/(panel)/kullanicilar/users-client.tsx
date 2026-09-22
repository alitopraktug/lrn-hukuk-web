"use client";

import { useActionState, useState, startTransition } from "react";
import { createUserAction, resetUserPasswordAction, updateUserAction, type TempPasswordState } from "@/app/admin/(panel)/kullanicilar/actions";
import { SubmitButton } from "@/components/admin/client";
import { Alert, Field, FormFeedback, Select, TextInput, btnClass } from "@/components/admin/ui";
import { useServerForm } from "@/components/admin/use-server-form";
import { idleState } from "@/lib/actions";

function TempPassword({ email, password }: { email?: string; password: string }) {
  return (
    <Alert tone="warning" className="mt-4">
      <p className="font-semibold">Geçici parola — bir daha gösterilmeyecek</p>
      <p className="mt-1 text-[0.88rem]">
        {email ? <>{email} için geçici parola: </> : null}
        <code className="select-all rounded bg-white px-2 py-1 font-mono text-[0.95rem] text-foreground">{password}</code>
      </p>
      <p className="mt-2 text-[0.85rem]">Bu parolayı güvenli bir kanaldan iletin. Kullanıcı ilk girişte parolasını değiştirmek zorundadır.</p>
    </Alert>
  );
}

export function CreateUserForm() {
  const { state, pending, onSubmit } = useServerForm(createUserAction as never);
  const s = state as TempPasswordState;
  const e = s.fieldErrors ?? {};
  return (
    <form onSubmit={onSubmit} noValidate>
      <div className="grid gap-5 md:grid-cols-[1fr_1fr_11rem_auto] md:items-end">
        <Field label="Ad soyad" name="name" required error={e.name}>
          <TextInput name="name" required maxLength={100} error={e.name} autoComplete="off" />
        </Field>
        <Field label="E-posta" name="email" required error={e.email}>
          <TextInput name="email" type="email" required maxLength={200} error={e.email} autoComplete="off" />
        </Field>
        <Field label="Rol" name="role" error={e.role}>
          <Select name="role" defaultValue="EDITOR">
            <option value="EDITOR">Editör</option>
            <option value="ADMIN">Yönetici</option>
          </Select>
        </Field>
        <SubmitButton pending={pending} activeIntent={null} pendingLabel="Oluşturuluyor…">
          Kullanıcı ekle
        </SubmitButton>
      </div>
      <FormFeedback state={s.tempPassword ? { status: "idle" } : s} className="mt-4" />
      {s.tempPassword ? <TempPassword email={s.email} password={s.tempPassword} /> : null}
    </form>
  );
}

export function EditUserForm({ id, name, role, active, isSelf }: { id: string; name: string; role: "ADMIN" | "EDITOR"; active: boolean; isSelf: boolean }) {
  const { state, pending, onSubmit } = useServerForm((prev, fd) => updateUserAction(id, prev, fd));
  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-wrap items-end gap-3">
      <div className="min-w-48 flex-1">
        <label htmlFor={`n-${id}`} className="mb-1 block text-[0.78rem] font-semibold">
          Ad soyad
        </label>
        <input id={`n-${id}`} name="name" defaultValue={name} maxLength={100} required className="block w-full rounded-md border border-foreground/25 bg-white px-3 py-2 text-[0.92rem]" />
      </div>
      <div>
        <label htmlFor={`r-${id}`} className="mb-1 block text-[0.78rem] font-semibold">
          Rol
        </label>
        <select id={`r-${id}`} name="role" defaultValue={role} disabled={isSelf} className="block rounded-md border border-foreground/25 bg-white px-3 py-2 text-[0.92rem] disabled:bg-admin">
          <option value="EDITOR">Editör</option>
          <option value="ADMIN">Yönetici</option>
        </select>
        {isSelf ? <input type="hidden" name="role" value={role} /> : null}
      </div>
      <label className="flex items-center gap-2 pb-2 text-[0.9rem]">
        <input type="checkbox" name="active" defaultChecked={active} disabled={isSelf} className="h-4 w-4 accent-forest" />
        Etkin
      </label>
      {isSelf ? <input type="hidden" name="active" value="on" /> : null}
      <SubmitButton pending={pending} activeIntent={null} variant="secondary">
        Kaydet
      </SubmitButton>
      {state.status !== "idle" ? <p className={`basis-full text-[0.85rem] ${state.status === "success" ? "text-forest" : "font-medium text-danger"}`}>{state.message}</p> : null}
    </form>
  );
}

export function ResetPasswordButton({ id }: { id: string }) {
  const [state, dispatch, pending] = useActionState((prev: TempPasswordState) => resetUserPasswordAction(id, prev), idleState as TempPasswordState);
  const [confirming, setConfirming] = useState(false);
  return (
    <div>
      {!confirming && !state.tempPassword ? (
        <button type="button" onClick={() => setConfirming(true)} className={btnClass.ghost}>
          Parolayı sıfırla
        </button>
      ) : null}
      {confirming && !state.tempPassword ? (
        <div className="flex flex-wrap items-center gap-2 text-[0.88rem]">
          <span>Kullanıcının tüm oturumları kapanır. Emin misiniz?</span>
          <button type="button" disabled={pending} className={btnClass.danger} onClick={() => startTransition(() => dispatch())}>
            {pending ? "Oluşturuluyor…" : "Evet, sıfırla"}
          </button>
          <button type="button" className={btnClass.secondary} onClick={() => setConfirming(false)}>
            Vazgeç
          </button>
        </div>
      ) : null}
      {state.tempPassword ? <TempPassword email={state.email} password={state.tempPassword} /> : null}
      {state.status === "error" ? <p className="text-[0.85rem] font-medium text-danger">{state.message}</p> : null}
    </div>
  );
}
