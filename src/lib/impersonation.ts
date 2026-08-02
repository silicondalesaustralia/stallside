import { auth } from "@/lib/auth";

export async function getSessionImpersonator() {
  const session = await auth();
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
