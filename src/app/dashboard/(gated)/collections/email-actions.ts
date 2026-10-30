"use server";

import { requireOwnerWrite } from "@/lib/session";
import { emailCollectionCustomers, emailOrderCustomer } from "@/lib/collections/customer-email";

export async function sendOrderCustomerEmail(input: {
  orderId: string;
  subject: string;
  message: string;
}) {
  const { owner, user } = await requireOwnerWrite();
  return emailOrderCustomer({ ownerId: owner.id, fallbackReplyTo: user.email ?? null }, input);
}

/** Email paid customers on a specific Collections group (one pre-order page). */
export async function sendCollectionGroupCustomerEmails(input: {
  orderIds: string[];
  subject: string;
  message: string;
}) {
  const { owner, user } = await requireOwnerWrite();
  return emailCollectionCustomers({ ownerId: owner.id, fallbackReplyTo: user.email ?? null }, input);
}
