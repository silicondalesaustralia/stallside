import Link from "next/link";
import { ASSISTANT_PATH } from "@/lib/website/readiness";
import NoProductsWarning from "./NoProductsWarning";
import AssistantHowItWorks from "./AssistantHowItWorks";

type Props = { hasSite: boolean; productCount: number; editorHref: string };

/** Replaces the template/look-based AI builder for owners on the guided assistant. */
export default function AssistantEntryCard({ hasSite, productCount, editorHref }: Props) {
  return (
    <>
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-[var(--field)]">
          Create your website with AI
        </h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Answer a few questions about your business and Vendl builds a draft website you can preview and edit.
        </p>
      </div>
      <AssistantHowItWorks editorHref={editorHref} />
      {productCount === 0 ? <NoProductsWarning /> : null}
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
