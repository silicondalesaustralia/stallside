import SectionCopy from "@/components/studio/SectionCopy";
import SectionElement from "@/components/studio/SectionElement";

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
          <SectionElement el="stepTitle" className="font-semibold text-[var(--m-ink)]">
            <SectionCopy k="stepPay" fallback="Choose how you pay" />
          </SectionElement>
          <SectionElement el="stepText" className="mt-0.5 text-sm text-[var(--m-muted)]">
            {plansSummary}
          </SectionElement>
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
          <SectionElement el="stepTitle" className="font-semibold text-[var(--m-ink)]">
            {step2Title}
          </SectionElement>
          {step2Body ? (
            <SectionElement el="stepText" className="mt-0.5 text-sm text-[var(--m-muted)]">
              {step2Body}
            </SectionElement>
          ) : null}
        </div>
      </li>
    </ol>
  );
}
