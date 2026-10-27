import Link from "next/link";

export type CommunicationTab = "email" | "sms";

export function communicationTabFrom(tab: string | undefined): CommunicationTab {
  return tab === "sms" ? "sms" : "email";
}

const TABS: { id: CommunicationTab; label: string; soon?: boolean }[] = [
  { id: "email", label: "Email" },
  { id: "sms", label: "SMS", soon: true },
];

export default function CommunicationTabs({ active }: { active: CommunicationTab }) {
  return (
    <nav className="flex flex-wrap gap-2" aria-label="Message channels">
      {TABS.map((tab) => (
        <Link
          key={tab.id}
          href={tab.id === "email" ? "/dashboard/communication" : `/dashboard/communication?tab=${tab.id}`}
          aria-current={tab.id === active ? "page" : undefined}
          className={`rounded-full px-3.5 py-1.5 text-sm font-semibold ${
            tab.id === active
              ? "bg-[var(--field)] text-[var(--ink-on-dark)]"
              : "bg-white text-[var(--ink)] outline outline-[var(--line)] hover:bg-[var(--wash)]"
          }`}
        >
          {tab.label}
          {tab.soon ? <span className="ml-1.5 text-xs font-normal opacity-70">Coming soon</span> : null}
        </Link>
      ))}
    </nav>
  );
}
