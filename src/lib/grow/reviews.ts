import crypto from "node:crypto";
import { prisma } from "@/lib/prisma";
import { GROW_ORDER_STATUSES } from "@/lib/grow/segments";

export function newReviewToken(): string {
  return crypto.randomBytes(24).toString("hex");
}

export async function createReviewInvite(input: {
  ownerId: string;
  orderId: string;
  productId?: string | null;
  customerId?: string | null;
}) {
  const order = await prisma.order.findFirst({
    where: {
      id: input.orderId,
      ownerId: input.ownerId,
      paymentStatus: { in: GROW_ORDER_STATUSES },
    },
    select: { id: true, customerId: true },
  });
  if (!order) throw new Error("Order not eligible");

  const productId = input.productId ?? null;
  const existing = await prisma.review.findFirst({
    where: {
      orderId: order.id,
      productId,
    },
  });
  if (existing) return existing;

  return prisma.review.create({
    data: {
      ownerId: input.ownerId,
      orderId: order.id,
      productId,
      customerId: input.customerId ?? order.customerId,
      rating: 0,
      body: "",
      status: "PENDING",
      token: newReviewToken(),
    },
  });
}

export async function submitReview(input: {
  token: string;
  rating: number;
  title?: string;
  body: string;
}) {
  if (input.rating < 1 || input.rating > 5) throw new Error("Invalid rating");
  const body = input.body.trim();
  if (body.length < 2) throw new Error("Please write a short review");

  const review = await prisma.review.findUnique({
    where: { token: input.token },
  });
  if (!review) throw new Error("Invalid link");
  if (review.rating > 0 && review.body) {
    throw new Error("Review already submitted");
  }

  return prisma.review.update({
    where: { id: review.id },
    data: {
      rating: input.rating,
      title: input.title?.trim() || null,
      body,
      status: "PENDING",
    },
  });
}
