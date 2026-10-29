import { test } from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { verifyResendWebhook } from "./verify-resend-webhook";

const KEY = Buffer.from("test-signing-key-for-resend-webhooks");
process.env.RESEND_WEBHOOK_SECRET = `whsec_${KEY.toString("base64")}`;

const BODY = JSON.stringify({ type: "email.opened", data: { email_id: "abc" } });

function sign(id: string, timestamp: string, body: string): string {
  const digest = createHmac("sha256", KEY).update(`${id}.${timestamp}.${body}`).digest("base64");
  return `v1,${digest}`;
}

function now(): string {
  return String(Math.floor(Date.now() / 1000));
}

test("accepts a correctly signed event", () => {
  const ts = now();
  const signature = `v1,bogus ${sign("msg_1", ts, BODY)}`;
  assert.equal(verifyResendWebhook(BODY, { id: "msg_1", timestamp: ts, signature }), true);
});

test("rejects a tampered body", () => {
  const ts = now();
  const signature = sign("msg_1", ts, BODY);
  assert.equal(verifyResendWebhook(`${BODY} `, { id: "msg_1", timestamp: ts, signature }), false);
});

test("rejects stale timestamps", () => {
  const ts = String(Math.floor(Date.now() / 1000) - 3600);
  const signature = sign("msg_1", ts, BODY);
  assert.equal(verifyResendWebhook(BODY, { id: "msg_1", timestamp: ts, signature }), false);
});

test("rejects missing headers", () => {
  assert.equal(verifyResendWebhook(BODY, { id: null, timestamp: now(), signature: "v1,x" }), false);
});
