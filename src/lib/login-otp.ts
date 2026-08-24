import crypto from "node:crypto";
import { prisma } from "@/lib/prisma";
import { APP_NAME } from "@/lib/constants";
import { sendOwnerEmail } from "@/lib/notify-email";
import {
  assertRateLimit,
  bumpRateLimit,
  clearRateLimitBucket,
  clientIpFromHeaders,
  rateLimitCount,
  RateLimitError,
} from "@/lib/rate-limit";

const OTP_TTL_MS = 10 * 60 * 1000;
const OTP_PREFIX = "otp:";
const SEND_WINDOW_MS = 15 * 60 * 1000;
const SEND_PER_EMAIL = 5;
const SEND_PER_IP = 20;
const FAIL_WINDOW_MS = 15 * 60 * 1000;
const FAIL_PER_EMAIL = 10;

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
  const subject = `${code} is your ${APP_NAME} code`;
  const html = `
    <div style="font-family:system-ui,sans-serif;line-height:1.5;color:#182C1B">
      <p style="font-size:18px;font-weight:600">Your ${APP_NAME} sign-in code</p>
      <p style="font-size:32px;font-weight:700;letter-spacing:0.2em;margin:20px 0">${code}</p>
      <p>Enter this code in ${APP_NAME}. It expires in 10 minutes.</p>
    </div>
  `;

  try {
    await sendOwnerEmail(email, subject, html, { kind: "otp" });
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.log(`\n[${APP_NAME} login code] ${email}\n${code}\n`);
      return;
    }
    throw error;
  }
}

export async function issueLoginOtp(email: string) {
  const normalized = email.trim().toLowerCase();
  const ip = await clientIpFromHeaders();

  await assertRateLimit({
    bucket: `otp-send:${normalized}`,
    limit: SEND_PER_EMAIL,
    windowMs: SEND_WINDOW_MS,
  });
  await assertRateLimit({
    bucket: `otp-send-ip:${ip}`,
    limit: SEND_PER_IP,
    windowMs: SEND_WINDOW_MS,
  });

  const code = String(crypto.randomInt(100000, 999999));
  const identifier = otpIdentifier(normalized);
  const token = hashOtp(normalized, code);

  await prisma.verificationToken.deleteMany({ where: { identifier } });
  await prisma.verificationToken.create({
    data: {
      identifier,
      token,
      expires: new Date(Date.now() + OTP_TTL_MS),
    },
  });
  await sendOtpEmail(normalized, code);
}

/** Returns true if code matched and was consumed. */
export async function consumeLoginOtp(email: string, code: string) {
  const cleaned = code.replace(/\s+/g, "");
  if (!/^\d{6}$/.test(cleaned)) return false;

  const failBucket = `otp-fail:${email}`;
  const failCount = await rateLimitCount(failBucket);

  const identifier = otpIdentifier(email);
  const token = hashOtp(email, cleaned);
  const row = await prisma.verificationToken.findUnique({ where: { token } });
  if (row && row.identifier === identifier && row.expires.getTime() >= Date.now()) {
    await prisma.verificationToken.deleteMany({ where: { identifier } });
    await clearRateLimitBucket(failBucket);
    return true;
  }

  if (row?.expires && row.expires.getTime() < Date.now()) {
    await prisma.verificationToken.deleteMany({ where: { identifier } });
  }

  if (failCount >= FAIL_PER_EMAIL) return false;
  await bumpRateLimit({ bucket: failBucket, windowMs: FAIL_WINDOW_MS });
  return false;
}

export { RateLimitError };
