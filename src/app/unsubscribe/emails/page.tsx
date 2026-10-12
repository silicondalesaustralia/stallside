import { APP_NAME } from "@/lib/constants";
import { verifyLifecycleUnsub } from "@/lib/lifecycle-emails/unsubscribe";
import { unsubscribeLifecycleEmails } from "./actions";

const MESSAGES: Record<string, string> = {
  done: `You're unsubscribed. We won't send you ${APP_NAME} tips, updates, or announcements. Sign-in codes, order alerts, and billing emails still arrive.`,
  error: "Something went wrong. Please try again, or reply to any of our emails and we'll remove you.",
  invalid: "This unsubscribe link is invalid. Reply to any of our emails and we'll remove you.",
};

export default async function LifecycleUnsubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ t?: string; s?: string }>;
}) {
  const sp = await searchParams;
  const token = sp.t ?? "";
  const email = token ? verifyLifecycleUnsub(token) : null;
  const message = sp.s ? MESSAGES[sp.s] : !email ? MESSAGES.invalid : null;

  return (
    <main className="mx-auto flex min-h-full max-w-md flex-col justify-center px-6 py-16">
      <h1 className="text-2xl font-semibold tracking-tight">Unsubscribe</h1>
      {message ? (
        <p className="mt-3 text-[var(--muted)]">{message}</p>
      ) : (
        <form action={unsubscribeLifecycleEmails} className="mt-3 space-y-4">
          <p className="text-[var(--muted)]">
            Stop {APP_NAME} tips, updates, and announcements to{" "}
            <strong>{email}</strong>? Sign-in codes, order alerts, and billing
            emails will still arrive.
          </p>
          <input type="hidden" name="t" value={token} />
          <button
            type="submit"
            className="rounded-full bg-[#2E7D3F] px-5 py-2.5 font-semibold text-white"
          >
            Unsubscribe
          </button>
        </form>
      )}
    </main>
  );
}
