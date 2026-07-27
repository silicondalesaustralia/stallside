import Link from "next/link";
import { APP_NAME } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { SubStatus } from "@/generated/prisma/client";

async function applyUnsubscribe(token: string): Promise<"ok" | "already" | "invalid"> {
  const sub = await prisma.restockSubscriber.findUnique({
    where: { unsubToken: token },
    select: { id: true, status: true },
  });
  if (!sub) return "invalid";
  if (sub.status === SubStatus.UNSUBSCRIBED) return "already";
  await prisma.restockSubscriber.update({
    where: { id: sub.id },
    data: {
      status: SubStatus.UNSUBSCRIBED,
      unsubscribedAt: new Date(),
    },
  });
  return "ok";
}

export default async function UnsubscribeRestockPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const trimmed = token?.trim() ?? "";
  const result = trimmed ? await applyUnsubscribe(trimmed) : "invalid";

  const copy =
    result === "ok"
      ? "You're unsubscribed. We won't email you about this stand again."
      : result === "already"
        ? "You're already unsubscribed from restock alerts."
        : "This unsubscribe link is invalid or expired.";

  return (
    <main className="mx-auto flex min-h-full max-w-lg flex-1 flex-col justify-center px-6 py-16">
      <div className="rounded-[var(--radius)] border border-[var(--line)] bg-[var(--panel)] p-8">
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-[var(--field)]">
          Unsubscribe
        </h1>
        <p className="mt-4 text-[var(--muted)]">{copy}</p>
      </div>
      <Link
        href="/"
        className="mt-8 text-center text-sm text-[var(--leaf-dark)] underline"
      >
        Back to {APP_NAME}
      </Link>
    </main>
  );
}
