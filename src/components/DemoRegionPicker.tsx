import Link from "next/link";
import { DEMO_REGIONS, type DemoRegion } from "@/lib/demo";

export default function DemoRegionPicker({
  selected,
}: {
  selected?: DemoRegion | null;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {DEMO_REGIONS.map((region) => {
        const active = selected === region.id;
        return (
          <Link
            key={region.id}
            href={`/demo?region=${region.id}`}
            className={`rounded-[var(--radius)] border px-4 py-4 transition ${
              active
                ? "border-[var(--leaf)] bg-[var(--leaf)]/10 text-[var(--field)]"
                : "border-[var(--line)] bg-[var(--panel)] text-[var(--ink)] hover:border-[var(--leaf)]"
            }`}
          >
            <p className="font-[family-name:var(--font-display)] text-lg font-bold tracking-tight">
              {region.label}
            </p>
            <p className="mt-1 text-sm font-medium text-[var(--field)]">
              {region.standName}
            </p>
            <p className="mt-0.5 text-sm text-[var(--muted)]">{region.description}</p>
          </Link>
        );
      })}
    </div>
  );
}
