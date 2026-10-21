import Link from "next/link";
import OnboardingStepIcon, {
  type OnboardingStepIconName,
} from "@/components/onboarding/OnboardingStepIcon";

export default function GetStartedCard({
  number,
  icon,
  title,
  body,
  href,
  cta,
  done,
  extraLinks = [],
}: {
  number: number;
  icon: OnboardingStepIconName;
  title: string;
  body: string;
  href: string;
  cta: string;
  done: boolean;
  extraLinks?: { href: string; label: string }[];
}) {
  return (
    <li
      className={`flex flex-col gap-3 rounded-2xl border p-5 ${
        done ? "border-[var(--leaf)]/40 bg-[var(--leaf)]/5" : "border-[var(--line)] bg-white"
      }`}
    >
      <div className="flex items-center gap-3">
        <span className="relative flex size-11 shrink-0 items-center justify-center rounded-full bg-[var(--leaf)]/10 text-[var(--leaf)]">
          <OnboardingStepIcon name={icon} />
          <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-[var(--leaf)] text-[11px] font-semibold text-white">
            {done ? "✓" : number}
          </span>
        </span>
        <h2 className={`font-semibold ${done ? "text-[var(--muted)] line-through" : ""}`}>
          {title}
        </h2>
      </div>
      <p className="text-sm text-[var(--muted)]">{body}</p>
      <div className="mt-auto flex flex-wrap items-center gap-3 text-sm">
        <Link
          href={href}
          className={
            done
              ? "font-medium text-[var(--leaf-dark)] underline"
              : "rounded-full bg-[var(--leaf)] px-4 py-2 font-semibold text-white hover:bg-[var(--leaf-dark)]"
          }
        >
          {done ? "Open" : cta}
        </Link>
        {extraLinks.map((link) => (
          <Link key={link.href} href={link.href} className="text-[var(--leaf-dark)] underline">
            {link.label}
          </Link>
        ))}
      </div>
    </li>
  );
}
