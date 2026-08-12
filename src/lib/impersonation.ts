import { getAuthSession } from "@/lib/session";

export async function getSessionImpersonator() {
  const session = await getAuthSession();
  return session?.impersonator ?? null;
}

/** Block destructive owner actions while an admin is viewing as them. */
export async function assertNotImpersonating(): Promise<{ error: string } | null> {
  const impersonator = await getSessionImpersonator();
  if (!impersonator) return null;
  return {
    error: "Not allowed while viewing as another user. Exit admin login-as first.",
  };
}
