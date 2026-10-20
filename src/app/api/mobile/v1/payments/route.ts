import type { Owner } from "@/generated/prisma/client";
import { paymentsQuery, savePaymentsBody, type PaymentsResponse } from "@/contracts/mobile/payments";
import { requireMobileOwner } from "@/lib/mobile/require-owner";
import { loadOwnerStandPayments } from "@/lib/stand-payments/load";
import { saveOwnerStandPayments } from "@/lib/stand-payments/service";
import { mobileError, mobileJson, mobileServerError, readMobileBody, readMobileQuery } from "@/lib/mobile/http";

async function paymentsResponse(owner: Owner, standId: string) {
  const data = await loadOwnerStandPayments(owner, standId);
  if (!data) return mobileError(404, "Business not found.");
  const { stand, method } = data;
  return mobileJson<PaymentsResponse>({
    currency: stand.currency,
    choices: {
      acceptCash: stand.acceptCash,
      acceptLocalTransfer: stand.acceptLocalTransfer,
      localTransferAlias: data.alias,
      acceptCard: stand.acceptCard,
      acceptSquare: stand.acceptSquare,
    },
    localTransfer: method
      ? { label: method.aliasLabel, placeholder: method.aliasPlaceholder, hint: method.aliasHint }
      : null,
    cardReady: data.cardReady,
    stripe: data.stripe,
    square: data.square,
    squareReady: data.squareReady,
    squareIsProvider: data.squareIsProvider,
  });
}

export async function GET(request: Request) {
  const guard = await requireMobileOwner(request);
  if (!guard.ok) return guard.response;
  const query = readMobileQuery(request, paymentsQuery);
  if (!query.ok) return query.response;
  try {
    return await paymentsResponse(guard.value.owner, query.data.standId);
  } catch (error) {
    return mobileServerError("Mobile payments failed", error);
  }
}

/** Saves checkout methods for one business; returns what was saved. */
export async function PUT(request: Request) {
  const guard = await requireMobileOwner(request);
  if (!guard.ok) return guard.response;
  const body = await readMobileBody(request, savePaymentsBody);
  if (!body.ok) return body.response;
  try {
    const { owner } = guard.value;
    const { standId, choices } = body.data;
    // The web form has no PayPal switch either, so saving turns it off.
    const result = await saveOwnerStandPayments(owner, standId, { ...choices, acceptPayPal: false });
    if ("error" in result) {
      return mobileError(result.error === "Stand not found." ? 404 : 400, result.error);
    }
    return await paymentsResponse(owner, standId);
  } catch (error) {
    return mobileServerError("Mobile payments save failed", error);
  }
}
