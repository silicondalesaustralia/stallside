export default function MembershipCategoryFooter({ text }: { text: string }) {
  return (
    <div className="mt-8 border-t border-[var(--mc-divider)] pt-5 sm:mt-10">
      <p className="text-[14px] leading-relaxed text-[var(--mc-muted)]">{text}</p>
    </div>
  );
}