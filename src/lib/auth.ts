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
        delete token.impersonatorId;
        delete token.impersonatorEmail;
        delete token.impersonatorRole;
        delete token.impersonatingOwnerId;
      }

      const userId = token.id ? String(token.id) : null;
      if (userId) {
        const dbUser = await prisma.user.findUnique({
          where: { id: userId },
          select: {
            id: true,
            role: true,
            owner: { select: { deletedAt: true } },
          },
        });
        if (!dbUser || dbUser.owner?.deletedAt) {
          return {};
        }
        token.id = dbUser.id;
        token.role = dbUser.role;
      } else if (token.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: String(token.email) },
          select: {
            id: true,
            role: true,
            owner: { select: { deletedAt: true } },
          },
        });
        if (!dbUser || dbUser.owner?.deletedAt) {
          return {};
        }
        token.id = dbUser.id;
        token.role = dbUser.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = String(token.id ?? "");
        session.user.role = token.role as Role;
      }
      if (token.impersonatorId) {
        session.impersonator = {
          id: String(token.impersonatorId),
          email: String(token.impersonatorEmail ?? ""),
        };
        if (token.impersonatingOwnerId) {
          session.impersonatingOwnerId = String(token.impersonatingOwnerId);
        }
      }
      return session;
    },
  },
  trustHost: true,
});
