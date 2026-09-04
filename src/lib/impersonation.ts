import { getAuthSession } from "@/lib/session";

export async function getSessionImpersonator() {
  const session = await getAuthSession();
  return session?.impersonator ?? null;
}

/** @deprecated Admins may write while login-as; kept as a no-op for older callers. */
export async function assertNotImpersonating(): Promise<{ error: string } | null> {
  return null;
}
