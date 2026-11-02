"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { ensureStorefront } from "@/lib/catalogue/storefront";
import { requireTagsPixelsOwner } from "./require-tags-owner";
import { extractStorefrontTracking } from "@/lib/website/tracking/config";
import {
  applySecretsUpdate,
  readTrackingSecrets,
  TRACKING_SECRET_KEYS,
  TRACKING_TEST_CODE_KEYS,
  validSecret,
  validTestCode,
  type SecretsUpdate,
} from "@/lib/website/tracking/secrets";
import { sendPurchaseToProviders, type ServerProvider } from "@/lib/website/tracking/server/send-conversions";
import { TAGS_PATH, type ActionMessage } from "./tags-state";

const LABELS: Record<string, string> = {
  metaCapiToken: "Meta access token",
  tiktokAccessToken: "TikTok access token",
  ga4ApiSecret: "GA4 API secret",
  metaTestEventCode: "Meta test event code",
  tiktokTestEventCode: "TikTok test event code",
};

export async function saveTrackingSecrets(_prev: ActionMessage, formData: FormData): Promise<ActionMessage> {
  const { owner } = await requireTagsPixelsOwner();
  const update: SecretsUpdate = { set: {}, clear: [], testCodes: {} };
  const problems: string[] = [];
  for (const key of TRACKING_SECRET_KEYS) {
    const value = String(formData.get(key) ?? "").trim();
    if (formData.get(`clear_${key}`)) update.clear.push(key);
    else if (value && validSecret(key, value)) update.set[key] = value;
    else if (value) problems.push(`${LABELS[key]} doesn't look right. Copy it again from the platform.`);
  }
  for (const key of TRACKING_TEST_CODE_KEYS) {
    if (!formData.has(key)) continue;
    const value = String(formData.get(key) ?? "").trim().toUpperCase();
    if (value && !validTestCode(key, value)) problems.push(`${LABELS[key]} should look like TEST12345.`);
    else update.testCodes[key] = value || null;
  }
  if (problems.length > 0) return { status: "error", message: "Nothing was saved.", lines: problems };

  try {
    const storefront = await ensureStorefront(owner.id, owner.businessName);
    await prisma.storefront.update({
      where: { id: storefront.id },
      data: { trackingSecrets: applySecretsUpdate(storefront.trackingSecrets, update) },
    });
  } catch (error) {
    console.error("Save tracking secrets failed", error);
    return { status: "error", message: "Couldn't save. Please try again." };
  }
  revalidatePath(TAGS_PATH);
  return { status: "ok", message: "Server-side settings saved. They apply to new website orders straight away." };
}

const PROVIDER_NAMES: Record<ServerProvider, string> = { meta: "Meta", tiktok: "TikTok", ga4: "GA4" };

/** Sends a sample purchase so the seller can see it in Meta/TikTok "Test events" or GA4 validation. */
export async function sendTestServerEvent(_prev: ActionMessage, formData: FormData): Promise<ActionMessage> {
  const { owner } = await requireTagsPixelsOwner();
  const raw = String(formData.get("provider") ?? "");
  const provider: ServerProvider | null = raw === "meta" || raw === "tiktok" || raw === "ga4" ? raw : null;
  if (!provider) return { status: "error", message: "Unknown provider." };
  try {
    const storefront = await ensureStorefront(owner.id, owner.businessName);
    const { ids } = extractStorefrontTracking(storefront.draftConfig);
    const secrets = readTrackingSecrets(storefront.trackingSecrets);
    if (provider === "meta" && !secrets.metaTestEventCode) return { status: "error", message: "Add your Meta test event code first, so the test doesn't count as a real sale." };
    if (provider === "tiktok" && !secrets.tiktokTestEventCode) return { status: "error", message: "Add your TikTok test event code first, so the test doesn't count as a real sale." };
    const h = await headers();
    const orderNumber = `TEST-${Date.now().toString(36).toUpperCase()}`;
    const tasks = sendPurchaseToProviders(ids, secrets, {
      eventId: `purchase_${orderNumber}`,
      orderNumber,
      eventTimeSec: Math.floor(Date.now() / 1000),
      valueCents: 1000,
      currency: "AUD",
      items: [{ id: "vendl-test", name: "Vendl test product", priceCents: 1000, quantity: 1 }],
      attribution: {
        v: 1,
        consent: "allowed",
        ip: h.get("x-forwarded-for")?.split(",")[0]?.trim(),
        userAgent: h.get("user-agent") ?? undefined,
      },
    }, { only: provider, test: true });
    if (tasks.length === 0) return { status: "error", message: `Save the ${PROVIDER_NAMES[provider]} ID above and its server credential first.` };
    const [{ result }] = await Promise.all(tasks);
    if (!result.ok) return { status: "error", message: `${PROVIDER_NAMES[provider]} rejected the test event.`, lines: [result.error] };
    const where = provider === "ga4" ? (result.detail ?? "GA4 accepted it.") : `Check Events Manager → Test events for order ${orderNumber}.`;
    return { status: "ok", message: `${PROVIDER_NAMES[provider]} accepted the test purchase.`, lines: [where] };
  } catch (error) {
    console.error("Test server event failed", error);
    return { status: "error", message: "Couldn't send the test event. Please try again." };
  }
}
