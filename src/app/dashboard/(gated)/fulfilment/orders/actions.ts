"use server";

import { revalidatePath } from "next/cache";
import { FulfilmentStatus } from "@/generated/prisma/client";
import { requireOwnerWrite } from "@/lib/session";
import {
  setOrderItemPacked,
  setOrdersOpsStatus,
  updateFulfilmentSellerNotes,
} from "@/lib/ops/board";

const REVALIDATE_PATHS = [
  "/dashboard/fulfilment/orders",
  "/dashboard/collections",
  "/dashboard/operate",
] as const;

function revalidateOps() {
  for (const path of REVALIDATE_PATHS) revalidatePath(path);
}

const STATUS_VALUES = new Set<string>(Object.values(FulfilmentStatus));

function parseStatus(raw: string): FulfilmentStatus | null {
  if (!STATUS_VALUES.has(raw)) return null;
  return raw as FulfilmentStatus;
}

export async function bulkSetOpsStatus(formData: FormData) {
  const { owner } = await requireOwnerWrite();
  const orderIds = formData.getAll("orderIds").map(String).filter(Boolean);
  const status = parseStatus(String(formData.get("status") ?? ""));
  if (!status) return { updated: 0, errors: ["Invalid status."] };
  if (orderIds.length === 0) {
    return { updated: 0, errors: ["No orders selected."] };
  }

  const result = await setOrdersOpsStatus({
    ownerId: owner.id,
    orderIds,
    status,
  });
  revalidateOps();
  return result;
}

export async function toggleItemPacked(formData: FormData) {
  const { owner } = await requireOwnerWrite();
  const orderItemId = String(formData.get("orderItemId") ?? "");
  const packed = String(formData.get("packed") ?? "") === "1";
  if (!orderItemId) throw new Error("Missing item");

  await setOrderItemPacked({ ownerId: owner.id, orderItemId, packed });
  revalidateOps();
}

export async function saveSellerNotes(formData: FormData) {
  const { owner } = await requireOwnerWrite();
  const orderId = String(formData.get("orderId") ?? "");
  const notes = String(formData.get("notes") ?? "");
  if (!orderId) throw new Error("Missing order");

  await updateFulfilmentSellerNotes({
    ownerId: owner.id,
    orderId,
    notes,
  });
  revalidateOps();
}
