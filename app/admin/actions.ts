"use server";

import { redirect } from "next/navigation";
import { audit } from "@/lib/audit";
import { getCurrentUser, destroyCurrentSession } from "@/lib/auth/session";
import { ADMIN_LOGIN_PATH } from "@/lib/auth/constants";

export async function logoutAction(): Promise<void> {
  const user = await getCurrentUser();
  if (user) await audit({ user, action: "logout" });
  await destroyCurrentSession();
  redirect(ADMIN_LOGIN_PATH);
}
