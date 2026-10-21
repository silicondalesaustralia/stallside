import SectionCopy from "@/components/studio/SectionCopy";
import SectionElement from "@/components/studio/SectionElement";

export default function MembershipCategoryFooter({ text }: { text: string }) {
  return (
    <div className="mt-8 border-t border-[var(--mc-divider)] pt-5 sm:mt-10">
      <SectionElement el="footer" className="text-[14px] leading-relaxed text-[var(--mc-muted)]">
        <SectionCopy k="footer" fallback={text} multiline />
      </SectionElement>
    </div>
  );
}
