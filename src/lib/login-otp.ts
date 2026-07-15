import crypto from "node:crypto";
import { prisma } from "@/lib/prisma";
import { APP_NAME } from "@/lib/constants";
import { cleanEnvSecret } from "@/lib/env";

const OTP_TTL_MS = 10 * 60 * 1000;
const OTP_PREFIX = "otp:";

function hashOtp(email: string, code: string) {
  const secret = process.env.AUTH_SECRET ?? "dev";
  return crypto
    .createHash("sha256")
    .update(`${email}:${code}:${secret}`)
    .digest("hex");
}

function otpIdentifier(email: string) {
  return `${OTP_PREFIX}${email}`;
}

async function sendOtpEmail(email: string, code: string) {
  const apiKey = cleanEnvSecret(process.env.RESEND_API_KEY);
  const subject = `${code} is your ${APP_NAME} code`;
  const html = `
    <div style="font-family:system-ui,sans-serif;line-height:1.5;color:#182C1B">
      <p style="font-size:18px;font-weight:600">Your ${APP_NAME} sign-in code</p>
      <p style="font-size:32px;font-weight:700;letter-spacing:0.2em;margin:20px 0">${code}</p>
      <p>Enter this code in Stallside. It expires in 10 minutes.</p>
    </div>
  `;

  if (!apiKey) {
    console.log(`\n[${APP_NAME} login code] ${email}\n${code}\n`);
    return;
  }

  const from = process.env.EMAIL_FROM ?? `${APP_NAME} <hello@stallside.app>`;
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to: [email], subject, html }),
  });

  if (!res.ok) {
    const detail = await res.text();
    console.error(`[${APP_NAME}] OTP email failed`, detail);
    if (process.env.NODE_ENV !== "production") {
      console.log(`\n[${APP_NAME} login code] ${email}\n${code}\n`);
      return;
    }
    throw new Error(`Could not send sign-in code: ${detail}`);
  }
}

export async function issueLoginOtp(email: string) {
  const code = String(crypto.randomInt(100000, 999999));
  const identifier = otpIdentifier(email);
  const token = hashOtp(email, code);

  await prisma.verificationToken.deleteMany({ where: { identifier } });
  await prisma.verificationToken.create({
    data: {
      identifier,
      token,
      expires: new Date(Date.now() + OTP_TTL_MS),
    },
  });
  await sendOtpEmail(email, code);
}

/** Returns true if code matched and was consumed. */
export async function consumeLoginOtp(email: string, code: string) {
  const cleaned = code.replace(/\s+/g, "");
  if (!/^\d{6}$/.test(cleaned)) return false;

  const identifier = otpIdentifier(email);
  const token = hashOtp(email, cleaned);
  const row = await prisma.verificationToken.findUnique({ where: { token } });
  if (!row || row.identifier !== identifier) return false;
  if (row.expires.getTime() < Date.now()) {
    await prisma.verificationToken.deleteMany({ where: { identifier } });
    return false;
  }

  await prisma.verificationToken.deleteMany({ where: { identifier } });
  return true;
}
