import { prisma } from "@/lib/prisma";
import { createOwnerWithTrial } from "@/lib/owner-trial";
import { consumeLoginOtp } from "@/lib/login-otp";
import { notifyAdminNewSignup } from "@/lib/notify-new-signup";
import {
  consumeLifetimeInvite,
  createOwnerWithLifetime,
} from "@/lib/lifetime-invite";
import {
  sendAndMarkCardWelcome,
  sendAndMarkTrialWelcome,
} from "@/lib/lifecycle-emails/send-and-mark";
import { normalizeAttribution } from "@/lib/ad-attribution";
import { Prisma } from "@/generated/prisma/client";

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
    const adAttribution = normalizeAttribution(intent?.adAttribution);

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
        owner = await createOwnerWithLifetime({
          userId: user.id,
          name,
          email,
          adAttribution,
        });
        lifetime = true;
      } else {
        console.warn("Lifetime invite could not be consumed; falling back to Free", {
          email,
          inviteToken,
        });
        owner = await createOwnerWithTrial({
          userId: user.id,
          name,
          email,
          adAttribution,
        });
      }
    } else {
      owner = await createOwnerWithTrial({
        userId: user.id,
        name,
        email,
        adAttribution,
      });
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
    if (lifetime) {
      await sendAndMarkCardWelcome(owner.id);
    } else {
      await sendAndMarkTrialWelcome(owner.id);
    }
  } else {
    const intent = await prisma.signupIntent.findUnique({ where: { email } });
    const adAttribution = normalizeAttribution(intent?.adAttribution);
    const owner = await prisma.owner.findUnique({ where: { userId: user.id } });
    if (!owner) {
      const created = await createOwnerWithTrial({
        userId: user.id,
        name: user.name || "My stand",
        email,
        adAttribution,
      });
      await sendAndMarkTrialWelcome(created.id);
    } else if (intent) {
      // Re-signup with an existing (incl. soft-closed) account: store click ids
      // and clear deletedAt so they can use the product again.
      // Soft-closed accounts must re-run the business-mode wizard.
      const restoring = Boolean(owner.deletedAt);
      await prisma.owner.update({
        where: { id: owner.id },
        data: {
          ...(adAttribution
            ? { adAttribution: adAttribution as Prisma.InputJsonValue }
            : {}),
          ...(restoring
            ? {
                deletedAt: null,
                onboardingCompletedAt: null,
                businessMode: null,
                emailAlertsEnabled: true,
                pushAlertsEnabled: true,
              }
            : {}),
        },
      });
      if (restoring) {
        await prisma.stand.updateMany({
          where: { ownerId: owner.id },
          data: { isActive: true },
        });
      }
      await prisma.signupIntent.delete({ where: { email } }).catch(() => null);
    }
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  };
}
