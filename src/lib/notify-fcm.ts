import crypto from "node:crypto";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { APP_NAME } from "@/lib/constants";

type FcmPayload = {
  title: string;
  body: string;
  data?: Record<string, string>;
};

const serviceAccountSchema = z.object({
  project_id: z.string().min(1),
  client_email: z.string().min(1),
  private_key: z.string().min(1),
});
type ServiceAccount = z.infer<typeof serviceAccountSchema>;

const tokenResponseSchema = z.object({
  access_token: z.string(),
  expires_in: z.number(),
});

const FCM_SCOPE = "https://www.googleapis.com/auth/firebase.messaging";
const TOKEN_URL = "https://oauth2.googleapis.com/token";

let cachedToken: { value: string; expiresAt: number } | null = null;

/** FCM_SERVICE_ACCOUNT_JSON: the Firebase service-account key file contents. */
function serviceAccount(): ServiceAccount | null {
  const raw = process.env.FCM_SERVICE_ACCOUNT_JSON?.trim();
  if (!raw) return null;
  try {
    const parsed = serviceAccountSchema.parse(JSON.parse(raw));
    return { ...parsed, private_key: parsed.private_key.replace(/\\n/g, "\n") };
  } catch (error) {
    console.error("FCM_SERVICE_ACCOUNT_JSON is not a valid service account key", error);
    return null;
  }
}

function signedAssertion(account: ServiceAccount): string {
  const now = Math.floor(Date.now() / 1000);
  const header = Buffer.from(JSON.stringify({ alg: "RS256", typ: "JWT" })).toString("base64url");
  const claims = Buffer.from(
    JSON.stringify({
      iss: account.client_email,
      scope: FCM_SCOPE,
      aud: TOKEN_URL,
      iat: now,
      exp: now + 3600,
    }),
  ).toString("base64url");
  const unsigned = `${header}.${claims}`;
  const signature = crypto.createSign("RSA-SHA256").update(unsigned).sign(account.private_key);
  return `${unsigned}.${signature.toString("base64url")}`;
}

async function accessToken(account: ServiceAccount): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) return cachedToken.value;

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: signedAssertion(account),
    }),
  });
  if (!res.ok) {
    throw new Error(`FCM token exchange failed ${res.status}: ${await res.text()}`);
  }
  const parsed = tokenResponseSchema.parse(await res.json());
  cachedToken = { value: parsed.access_token, expiresAt: Date.now() + parsed.expires_in * 1000 };
  return parsed.access_token;
}

export async function sendFcm(token: string, payload: FcmPayload): Promise<void> {
  const account = serviceAccount();
  if (!account) {
    console.log(
      `\n[${APP_NAME} FCM] missing FCM_SERVICE_ACCOUNT_JSON - would send to ${token.slice(0, 12)}…\n${payload.title}\n${payload.body}\n`,
    );
    return;
  }

  const res = await fetch(
    `https://fcm.googleapis.com/v1/projects/${account.project_id}/messages:send`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${await accessToken(account)}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: {
          token,
          notification: { title: payload.title, body: payload.body },
          data: payload.data ?? {},
          android: { priority: "HIGH", notification: { sound: "default" } },
        },
      }),
    },
  );

  if (!res.ok) {
    const text = await res.text();
    console.error("FCM send failed", res.status, text);
    if (res.status === 404 || /UNREGISTERED/.test(text)) {
      await prisma.pushDevice.deleteMany({ where: { token } });
    }
  }
}
