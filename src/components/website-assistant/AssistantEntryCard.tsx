import Link from "next/link";
import { ASSISTANT_PATH } from "@/lib/website/readiness";

type Props = { hasSite: boolean };

/** Replaces the template/look-based AI builder for owners on the guided assistant. */
export default function AssistantEntryCard({ hasSite }: Props) {
  return (
    <>
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-[var(--field)]">
          Create your website with AI
        </h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Answer a few questions about your business. Vendl plans your pages, writes them from your real details and
          builds a draft you can preview and edit. Nothing goes live until you publish.
        </p>
      </div>
      {hasSite ? (
        <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          You already have a website draft. Running the assistant again replaces its layouts and design — you&apos;ll be
          asked to confirm, and you can restore it afterwards.
        </p>
      ) : null}
      <Link
        href={ASSISTANT_PATH}
        className="w-fit rounded-full bg-[var(--field)] px-5 py-2.5 text-sm font-semibold text-white"
      >
        {hasSite ? "Rebuild my website with AI" : "Create my website with AI"}
      </Link>
    </>
  );
}
