"use client";

export default function MembershipUpfrontBenefits({
  id,
  open,
  onToggle,
  bullets,
  footnote,
}: {
  id: string;
  open: boolean;
  onToggle: () => void;
  bullets: string[];
  footnote: string | null;
}) {
  if (bullets.length === 0) return null;

  return (
    <div className="mt-4 rounded-[10px] bg-[var(--m-upfront-bg)] px-3 py-2.5">
      <button
        type="button"
        className="flex w-full items-center justify-between gap-2 text-left text-sm font-semibold"
        aria-expanded={open}
        aria-controls={id}
        onClick={onToggle}
      >
        Pay upfront and receive member extras
        <span aria-hidden>{open ? "−" : "+"}</span>
      </button>
      {open ? (
        <div id={id} className="mt-2 text-sm text-[var(--m-muted)]">
          <ul className="list-disc space-y-1 pl-4">
            {bullets.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
          {footnote ? (
            <p className="mt-2 text-[12px]">{footnote}</p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
