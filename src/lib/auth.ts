import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import type { Adapter } from "next-auth/adapters";
import type { Provider } from "next-auth/providers";
import type { Role } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { APP_NAME } from "@/lib/constants";
import { createOwnerWithTrial } from "@/lib/owner-trial";

const emailProvider: Provider = {
  id: "resend",
  name: "Email",
  type: "email",
  from: process.env.EMAIL_FROM ?? `${APP_NAME} <hello@stallside.app>`,
  maxAge: 60 * 60,
  async sendVerificationRequest({ identifier, url }) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.log(`\n[Stallside magic link] ${identifier}\n${url}\n`);
      return;
    }

    const from = process.env.EMAIL_FROM ?? `${APP_NAME} <hello@stallside.app>`;
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [identifier],
        subject: `Sign in to ${APP_NAME}`,
        html: `
          <div style="font-family:system-ui,sans-serif;line-height:1.5;color:#182C1B">
            <p style="font-size:18px;font-weight:600">Sign in to ${APP_NAME}</p>
            <p>Tap the button below. This link works once and expires in about an hour.</p>
            <p style="margin:24px 0">
              <a href="${url}"
                 style="background:#2E7D3F;color:#fff;padding:12px 20px;border-radius:999px;text-decoration:none;font-weight:600">
                Sign in
              </a>
            </p>
            <p style="font-size:12px;color:#56684F">If the button doesn’t open the app, copy this URL into Stallside:</p>
            <p style="font-size:12px;word-break:break-all">${url}</p>
          </div>
        `,
      }),
    });

    if (!res.ok) {
      const detail = await res.text();
      console.error("[Stallside] Resend failed", detail);
      // Local / misconfigured Resend: still print the link so sign-in is usable.
      // Production must verify EMAIL_FROM's domain at https://resend.com/domains
      if (process.env.NODE_ENV !== "production") {
        console.log(`\n[Stallside magic link] ${identifier}\n${url}\n`);
        return;
      }
      throw new Error(`Resend failed: ${detail}`);
    }
  },
};

function createAdapter(): Adapter {
  const base = PrismaAdapter(prisma);
  return {
    ...base,
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

      const intent = await prisma.signupIntent.findUnique({
        where: { email: user.email.toLowerCase() },
      });
      const name = (intent?.name || user.name || "My stand").trim();

      if (intent) {
        await prisma.signupIntent.delete({ where: { email: intent.email } }).catch(() => null);
      }
      if (name && name !== user.name) {
        await prisma.user.update({
          where: { id: user.id },
          data: { name },
        });
      }

      await createOwnerWithTrial({
        userId: user.id,
        name,
        email: user.email,
      });
    },
  },
  trustHost: true,
});
