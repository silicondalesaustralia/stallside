import { prisma } from "@/lib/prisma";
import { createOwnerWithTrial } from "@/lib/owner-trial";
import { consumeLoginOtp } from "@/lib/login-otp";
import { notifyAdminNewSignup } from "@/lib/notify-new-signup";
import {
  consumeLifetimeInvite,
  createOwnerWithLifetime,
} from "@/lib/lifetime-invite";

/** Verify email code and return the Auth.js user (creating owner on first sign-in). */
export async function authorizeEmailOtp(emailRaw: string, codeRaw: string) {
  const email = emailRaw.trim().toLowerCase();
  const code = codeRaw.trim();
  if (!email.includes("@") || !code) return null;
  if (!(await consumeLoginOtp(email, code))) return null;

  let user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    const intent = await prisma.signupIntent.findUnique({ where: { email } });
    const name = (intent?.name || email.split("@")[0] || "My stand").trim();
    const inviteToken = intent?.inviteToken?.trim() || null;

    user = await prisma.user.create({
      data: {
        email,
        name,
        emailVerified: new Date(),
      },
    });

    let owner;
    let lifetime = false;
    if (inviteToken) {
      const claimed = await consumeLifetimeInvite({
        token: inviteToken,
        email,
        userId: user.id,
      });
      if (claimed) {
        owner = await createOwnerWithLifetime({ userId: user.id, name, email });
        lifetime = true;
      } else {
        console.warn("Lifetime invite could not be consumed; falling back to trial", {
          email,
          inviteToken,
        });
        owner = await createOwnerWithTrial({ userId: user.id, name, email });
      }
    } else {
      owner = await createOwnerWithTrial({ userId: user.id, name, email });
    }

    if (intent) {
      await prisma.signupIntent.delete({ where: { email } }).catch(() => null);
    }
    try {
      await notifyAdminNewSignup({
        name,
        email,
        userId: user.id,
        ownerId: owner.id,
        lifetime,
      });
    } catch (error) {
      console.error("Admin new-signup notify failed", error);
    }
  } else {
    const owner = await prisma.owner.findUnique({ where: { userId: user.id } });
    if (!owner) {
      await createOwnerWithTrial({
        userId: user.id,
        name: user.name || "My stand",
        email,
      });
    }
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  };
}
