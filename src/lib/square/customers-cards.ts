import { squareFetch } from "@/lib/square/client";

type SquareCard = {
  id?: string;
  card_brand?: string;
  last_4?: string;
};

export type SavedSquareCard = { cardId: string; label: string };

function cardLabel(card: SquareCard): string {
  const brand = (card.card_brand ?? "Card")
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
  return card.last_4 ? `${brand} •••• ${card.last_4}` : brand;
}

export async function createSquareCustomer(input: {
  accessToken: string;
  idempotencyKey: string;
  name: string;
  email: string;
  phone?: string | null;
  referenceId: string;
}): Promise<string> {
  const res = await squareFetch<{ customer?: { id?: string } }>("/v2/customers", {
    accessToken: input.accessToken,
    method: "POST",
    body: {
      idempotency_key: input.idempotencyKey,
      given_name: input.name.slice(0, 300),
      email_address: input.email,
      ...(input.phone ? { phone_number: input.phone } : {}),
      reference_id: input.referenceId,
    },
  });
  const id = res.customer?.id;
  if (!id) throw new Error("Square did not return a customer id");
  return id;
}

/**
 * Save a card on file. `sourceId` is a payment id (charge-and-store) or a
 * fresh card token (update card).
 */
export async function saveSquareCard(input: {
  accessToken: string;
  idempotencyKey: string;
  sourceId: string;
  customerId: string;
  referenceId: string;
}): Promise<SavedSquareCard> {
  const res = await squareFetch<{ card?: SquareCard }>("/v2/cards", {
    accessToken: input.accessToken,
    method: "POST",
    body: {
      idempotency_key: input.idempotencyKey,
      source_id: input.sourceId,
      card: { customer_id: input.customerId, reference_id: input.referenceId },
    },
  });
  const card = res.card;
  if (!card?.id) throw new Error("Square did not return a card id");
  return { cardId: card.id, label: cardLabel(card) };
}

export async function disableSquareCard(input: {
  accessToken: string;
  cardId: string;
}): Promise<void> {
  await squareFetch(`/v2/cards/${encodeURIComponent(input.cardId)}/disable`, {
    accessToken: input.accessToken,
    method: "POST",
    body: {},
  });
}
