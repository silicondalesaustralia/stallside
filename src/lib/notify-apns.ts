import crypto from "node:crypto";
import http2 from "node:http2";
import { APP_NAME } from "@/lib/constants";

type ApnsPayload = {
  title: string;
  body: string;
  data?: Record<string, string>;
};

function apnsConfigured() {
  return Boolean(
    process.env.APNS_KEY_ID &&
      process.env.APNS_TEAM_ID &&
      process.env.APNS_BUNDLE_ID &&
      process.env.APNS_KEY_P8,
  );
}

function normalizeToken(token: string) {
  return token.replace(/[^0-9a-fA-F]/g, "").toLowerCase();
}

function createApnsJwt() {
  const keyId = process.env.APNS_KEY_ID!;
  const teamId = process.env.APNS_TEAM_ID!;
  const p8 = process.env.APNS_KEY_P8!.replace(/\\n/g, "\n");

  const header = Buffer.from(JSON.stringify({ alg: "ES256", kid: keyId })).toString(
    "base64url",
  );
  const claims = Buffer.from(
    JSON.stringify({ iss: teamId, iat: Math.floor(Date.now() / 1000) }),
  ).toString("base64url");
  const unsigned = `${header}.${claims}`;
  const signer = crypto.createSign("SHA256");
  signer.update(unsigned);
  signer.end();
  const signature = signer
    .sign({ key: p8, dsaEncoding: "ieee-p1363" })
    .toString("base64url");
  return `${unsigned}.${signature}`;
}

export async function sendApns(token: string, payload: ApnsPayload) {
  if (!apnsConfigured()) {
    console.log(
      `\n[${APP_NAME} APNs] missing APNS_* env — would send to ${token.slice(0, 12)}…\n${payload.title}\n${payload.body}\n`,
    );
    return;
  }

  const deviceToken = normalizeToken(token);
  if (deviceToken.length < 64) {
    console.error("Invalid APNs device token length", deviceToken.length);
    return;
  }

  const host =
    process.env.APNS_USE_SANDBOX === "false"
      ? "https://api.push.apple.com"
      : "https://api.sandbox.push.apple.com";

  const jwt = createApnsJwt();
  const topic = process.env.APNS_BUNDLE_ID!;
  const body = JSON.stringify({
    aps: {
      alert: { title: payload.title, body: payload.body },
      sound: "default",
    },
    ...(payload.data ?? {}),
  });

  await new Promise<void>((resolve, reject) => {
    const client = http2.connect(host);
    client.on("error", reject);

    const req = client.request({
      ":method": "POST",
      ":path": `/3/device/${deviceToken}`,
      authorization: `bearer ${jwt}`,
      "apns-topic": topic,
      "apns-push-type": "alert",
      "apns-priority": "10",
      "content-type": "application/json",
    });

    let responseData = "";
    req.setEncoding("utf8");
    req.on("response", (headers) => {
      const status = Number(headers[":status"] ?? 0);
      req.on("data", (chunk) => {
        responseData += chunk;
      });
      req.on("end", () => {
        client.close();
        if (status >= 200 && status < 300) {
          resolve();
          return;
        }
        console.error("APNs send failed", status, responseData);
        reject(new Error(`APNs ${status}: ${responseData}`));
      });
    });
    req.on("error", (err) => {
      client.close();
      reject(err);
    });
    req.end(body);
  });
}

export function isApnsConfigured() {
  return apnsConfigured();
}
