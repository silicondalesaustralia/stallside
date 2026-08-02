import { cookies } from "next/headers";
import { encode } from "@auth/core/jwt";
import type { Role } from "@/generated/prisma/client";
import { cleanEnvSecret } from "@/lib/env";
import { SESSION_MAX_AGE_SEC, sessionCookieName } from "@/lib/auth-session";

export type SessionJwtClaims = {
  sub: string;
  id: string;
  email: string;
  name: string | null | undefined;
  role: Role;
  impersonatorId?: string;
  impersonatorEmail?: string;
  impersonatorRole?: Role;
  impersonatingOwnerId?: string;
};

function secureCookies(): boolean {
  return (process.env.AUTH_URL ?? "").startsWith("https://");
}

/** Replace the Auth.js session JWT cookie (login-as / exit). */
export async function writeSessionJwt(claims: SessionJwtClaims) {
  const secret = cleanEnvSecret(process.env.AUTH_SECRET);
  if (!secret) throw new Error("AUTH_SECRET is not set");

  const secure = secureCookies();
  const name = sessionCookieName(secure);
  const value = await encode({
    token: {
      ...claims,
      email: claims.email,
      name: claims.name ?? undefined,
    },
    secret,
    maxAge: SESSION_MAX_AGE_SEC,
    salt: name,
  });

  const jar = await cookies();
  jar.set(name, value, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure,
    maxAge: SESSION_MAX_AGE_SEC,
  });
}
