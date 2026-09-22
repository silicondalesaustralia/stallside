export default function MembershipHowItWorks({
  plansSummary,
  collectionDay,
  collectionNote,
  handoverCollect,
}: {
  plansSummary: string;
  collectionDay: string | null;
  collectionNote: string | null;
  handoverCollect: boolean;
}) {
  const step2Title = handoverCollect
    ? collectionDay
      ? `Make ${collectionDay} your collection day`
      : "Set your collection day"
    : "Arrange delivery";

  const step2Body = [
    collectionNote?.trim(),
    handoverCollect && !collectionNote
      ? "Collect during the nominated window."
      : null,
    !handoverCollect && !collectionNote ? "Delivered on your schedule." : null,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <ol className="flex flex-col gap-4">
      <li className="flex gap-3">
        <span
          className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[var(--m-selected-bg)] text-sm font-semibold text-[var(--m-button)]"
          aria-hidden
        >
          1
        </span>
        <div>
          <p className="font-semibold text-[var(--m-ink)]">Choose how you pay</p>
          <p className="mt-0.5 text-sm text-[var(--m-muted)]">{plansSummary}</p>
        </div>
      </li>
      <li className="flex gap-3">
        <span
          className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[var(--m-selected-bg)] text-sm font-semibold text-[var(--m-button)]"
          aria-hidden
        >
          2
        </span>
        <div>
          <p className="font-semibold text-[var(--m-ink)]">{step2Title}</p>
          {step2Body ? (
            <p className="mt-0.5 text-sm text-[var(--m-muted)]">{step2Body}</p>
          ) : null}
        </div>
      </li>
    </ol>
  );
}
