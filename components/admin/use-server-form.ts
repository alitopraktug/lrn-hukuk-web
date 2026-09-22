"use client";

import { startTransition, useActionState, useState, type FormEvent } from "react";
import { idleState, type ActionState } from "@/lib/actions";

/**
 * Server Action ile çalışan yönetim formları için kanca.
 *
 * Neden `<form action={…}>` yerine onSubmit? React 19, bir form eylemi tamamlanınca kontrolsüz alanları SIFIRLAR;
 * doğrulama hatasında kullanıcının yazdıkları silinirdi. Burada form kendi DOM durumunu korur, yalnızca FormData
 * (tıklanan gönder düğmesinin name/value çifti dahil) eyleme iletilir.
 */
export function useServerForm(action: (prev: ActionState, formData: FormData) => Promise<ActionState>) {
  const [state, dispatch, pending] = useActionState(action, idleState);
  const [intent, setIntent] = useState<string | null>(null);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const submitter = (e.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
    const formData = new FormData(e.currentTarget, submitter);
    setIntent(submitter?.value ?? null);
    startTransition(() => dispatch(formData));
  }

  return { state, pending, intent, onSubmit };
}
