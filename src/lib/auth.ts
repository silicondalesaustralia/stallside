import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import type { Adapter } from "next-auth/adapters";
import type { Provider } from "next-auth/providers";
import type { Role } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { APP_NAME } from "@/lib/constants";

const emailProvider: Provider = {
  id: "resend",
  name: "Email",
  type: "email",
  from: process.env.EMAIL_FROM ?? `${APP_NAME} <noreply@localhost>`,
  maxAge: 60 * 60,
  async sendVerificationRequest({ identifier, url }) {
    if (process.env.RESEND_API_KEY) {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: process.env.EMAIL_FROM ?? "Stallside <onboarding@resend.dev>",
          to: [identifier],
          subject: `Sign in to ${APP_NAME}`,
          html: `<p>Click to sign in:</p><p><a href="${url}">${url}</a></p>`,
        }),
      });
      if (!res.ok) {
        throw new Error(`Failed to send email: ${await res.text()}`);
      }
      return;
    }
    console.log(`\n[Stallside magic link] ${identifier}\n${url}\n`);
  },
};

function createAdapter(): Adapter {
  const base = PrismaAdapter(prisma);
  return {
    ...base,
    // Prisma throw if the session row is already gone — Auth.js still calls delete.
    deleteSession: async (sessionToken) => {
      await prisma.session.deleteMany({ where: { sessionToken } });
    },
  };
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: createAdapter(),
  session: { strategy: "jwt" },
  providers: [emailProvider],
  pages: {
    signIn: "/login",
    verifyRequest: "/login/check-email",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
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
  events: {
    async createUser({ user }) {
      if (!user.id || !user.email) return;
      const existing = await prisma.owner.findUnique({ where: { userId: user.id } });
      if (existing) return;
      await prisma.owner.create({
        data: {
          userId: user.id,
          businessName: user.name?.trim() || "My Farm Stand",
          contactEmail: user.email,
        },
      });
    },
  },
  trustHost: true,
});
