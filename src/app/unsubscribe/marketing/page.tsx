import { suppressMarketingEmail, verifyUnsubLink } from "@/lib/grow/consent";

export default async function MarketingUnsubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ t?: string }>;
}) {
  const sp = await searchParams;
  const parsed = sp.t ? verifyUnsubLink(sp.t) : null;
  let message = "This unsubscribe link is invalid or expired.";

  if (parsed) {
    await suppressMarketingEmail({
      ownerId: parsed.ownerId,
      email: parsed.email,
      reason: "unsubscribed",
    });
    message =
      "You're unsubscribed from marketing emails for this seller. Order receipts and pickup updates may still be sent when needed.";
  }

  return (
    <main className="mx-auto flex min-h-full max-w-md flex-col justify-center px-6 py-16">
      <h1 className="text-2xl font-semibold tracking-tight">Unsubscribe</h1>
      <p className="mt-3 text-[var(--muted)]">{message}</p>
    </main>
  );
}
