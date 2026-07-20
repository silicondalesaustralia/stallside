import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import type { Adapter } from "next-auth/adapters";
import type { Role } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { authorizeEmailOtp } from "@/lib/auth-otp-user";
import { SESSION_MAX_AGE_SEC, SESSION_UPDATE_AGE_SEC } from "@/lib/auth-session";

function createAdapter(): Adapter {
  const base = PrismaAdapter(prisma);
  return {
    ...base,
    deleteSession: async (sessionToken) => {
      await prisma.session.deleteMany({ where: { sessionToken } });
    },
  };
}

const useSecureCookies = (process.env.AUTH_URL ?? "").startsWith("https://");

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: createAdapter(),
  session: {
    strategy: "jwt",
    maxAge: SESSION_MAX_AGE_SEC,
    updateAge: SESSION_UPDATE_AGE_SEC,
  },
  jwt: {
    maxAge: SESSION_MAX_AGE_SEC,
  },
  cookies: {
    sessionToken: {
      name: useSecureCookies
        ? "__Secure-authjs.session-token"
        : "authjs.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: useSecureCookies,
        maxAge: SESSION_MAX_AGE_SEC,
      },
    },
  },
  providers: [
    Credentials({
      id: "otp",
      name: "Email code",
      credentials: {
        email: { label: "Email", type: "email" },
        code: { label: "Code", type: "text" },
      },
      async authorize(credentials) {
        const email = String(credentials?.email ?? "");
        const code = String(credentials?.code ?? "");
        return authorizeEmailOtp(email, code);
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: Role }).role;
      }
      if ((!token.role || !token.id) && token.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: String(token.email) },
          select: { id: true, role: true },
        });
        if (dbUser) {
          token.id = dbUser.id;
          token.role = dbUser.role;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = String(token.id ?? "");
        session.user.role = token.role as Role;
      }
      return session;
    },
  },
  trustHost: true,
});
