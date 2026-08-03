import type Stripe from "stripe";
import {
  BRAND_BY_PMC_METHOD,
  humanizePmcMethod,
  PMC_METHOD_SORT_ORDER,
  regionalPmcMethods,
} from "@/lib/stripe-pmc-labels";
import type { PaymentBrand } from "@/lib/payment-brand-assets";
import { getStripe } from "@/lib/stripe";

const PMC_META_KEYS = new Set([
  "id",
  "object",
  "active",
  "application",
  "is_default",
  "livemode",
  "name",
  "parent",
]);

export type ConnectPaymentMethodToggle = {
  method: string;
  label: string;
  brand: PaymentBrand | null;
  enabled: boolean;
  available: boolean;
  overridable: boolean;
};

type MethodSlot = {
  available: boolean;
  display_preference: {
    overridable: boolean | null;
    preference: string;
    value: string;
  };
};

function isMethodSlot(value: unknown): value is MethodSlot {
  if (!value || typeof value !== "object") return false;
  const slot = value as Record<string, unknown>;
  if (typeof slot.available !== "boolean") return false;
  const pref = slot.display_preference;
  if (!pref || typeof pref !== "object") return false;
  const p = pref as Record<string, unknown>;
  // Stripe may send overridable as null on some configs.
  const overridableOk =
    typeof p.overridable === "boolean" || p.overridable === null;
  return (
    overridableOk &&
    typeof p.preference === "string" &&
    typeof p.value === "string"
  );
}

export function parseConnectPaymentMethods(
  config: Stripe.PaymentMethodConfiguration,
  currency?: string,
): ConnectPaymentMethodToggle[] {
  const regional = currency ? regionalPmcMethods(currency) : null;
  const rows: ConnectPaymentMethodToggle[] = [];
  for (const [method, value] of Object.entries(config)) {
    if (PMC_META_KEYS.has(method) || !isMethodSlot(value)) continue;
    // Keep regional methods, plus anything Stripe already marks available.
    if (regional && !regional.has(method) && !value.available) continue;
    rows.push({
      method,
      label: humanizePmcMethod(method),
      brand: BRAND_BY_PMC_METHOD[method] ?? null,
      enabled: value.display_preference.value === "on",
      available: value.available,
      // null means Stripe did not lock it - treat as editable.
      overridable: value.display_preference.overridable !== false,
    });
  }
  return rows.sort((a, b) => {
    const ai = PMC_METHOD_SORT_ORDER.indexOf(a.method);
    const bi = PMC_METHOD_SORT_ORDER.indexOf(b.method);
    if (ai === -1 && bi === -1) return a.label.localeCompare(b.label);
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });
}

export async function getDefaultPaymentMethodConfiguration(
  stripeAccountId: string,
): Promise<Stripe.PaymentMethodConfiguration | null> {
  const stripe = getStripe();
  const list = await stripe.paymentMethodConfigurations.list(
    { limit: 20 },
    { stripeAccount: stripeAccountId },
  );
  const active = list.data.filter((c) => c.active);
  // Prefer the Connect child config (has parent) - that is what Dashboard
  // "Payment methods" edits and what direct-charge Checkout should follow.
  return (
    active.find((c) => c.is_default && c.parent) ??
    active.find((c) => c.parent) ??
    active.find((c) => c.is_default) ??
    active[0] ??
    null
  );
}

export async function listConnectPaymentMethodToggles(
  stripeAccountId: string,
  currency: string,
): Promise<{
  configurationId: string;
  methods: ConnectPaymentMethodToggle[];
} | null> {
  const config = await getDefaultPaymentMethodConfiguration(stripeAccountId);
  if (!config) return null;
  return {
    configurationId: config.id,
    methods: parseConnectPaymentMethods(config, currency),
  };
}

export async function setConnectPaymentMethodPreference(params: {
  stripeAccountId: string;
  configurationId: string;
  method: string;
  preference: "on" | "off";
  currency: string;
}): Promise<ConnectPaymentMethodToggle[]> {
  const stripe = getStripe();
  const updated = await stripe.paymentMethodConfigurations.update(
    params.configurationId,
    {
      [params.method]: {
        display_preference: { preference: params.preference },
      },
    } as Stripe.PaymentMethodConfigurationUpdateParams,
    { stripeAccount: params.stripeAccountId },
  );
  return parseConnectPaymentMethods(updated, params.currency);
}
