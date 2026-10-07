/** Native hover tip for membership editor field labels. */
export default function MembershipFieldHint({ tip }: { tip: string }) {
  return (
    <span
      className="inline-flex size-4 shrink-0 cursor-help items-center justify-center rounded-full border border-[var(--line)] text-[10px] font-semibold leading-none text-[var(--muted)]"
      title={tip}
      aria-label={tip}
      tabIndex={0}
    >
      ?
    </span>
  );
}
