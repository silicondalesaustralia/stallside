import Link from "next/link";

const STEPS = [
  "Tell us about your business. We fill in what Vendl already knows — your products, categories, stall details and search profile.",
  "Add your logo, colours and photos.",
  "Choose the pages you want, like About, FAQ, Visit us or Shop.",
  "Vendl plans and writes each page from your real details and builds a draft. This takes a minute or two.",
];

/** Explains the AI builder and offers the manual route into the front-end editor. */
export default function AssistantHowItWorks({ editorHref }: { editorHref: string }) {
  return (
    <div className="space-y-3 rounded-2xl border border-[var(--line)] bg-white p-5 text-sm">
      <h2 className="font-semibold text-[var(--field)]">How the AI builder works</h2>
      <ol className="list-decimal space-y-1 pl-5 text-[var(--muted)]">
        {STEPS.map((s) => (
          <li key={s}>{s}</li>
        ))}
      </ol>
      <p className="text-[var(--muted)]">
        Nothing goes live until you publish. Once your site is created you can change everything — text, photos,
        sections, pages and colours — in the front-end editor.
      </p>
      <p className="border-t border-[var(--line)] pt-3 text-[var(--muted)]">
        Rather build it yourself? Skip the AI and go straight to the front-end editor.{" "}
        <Link href={editorHref} className="font-medium text-[var(--field)] underline">
          Build manually in the editor
        </Link>
      </p>
    </div>
  );
}
