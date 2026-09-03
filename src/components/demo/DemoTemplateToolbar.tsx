import Link from "next/link";
import type { StudioTemplateId } from "@/lib/studio/types";
import { demoTemplatePath } from "@/lib/demo";

const LABELS: Record<StudioTemplateId, string> = {
  artisan: "Artisan",
  farmhouse: "Farmhouse",
  market: "Market",
};

export default function DemoTemplateToolbar({
  active,
}: {
  active: StudioTemplateId;
}) {
  return (
    <div className="sticky top-0 z-50 border-b border-[var(--line)] bg-[var(--panel)]/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-2.5 sm:px-6">
        <p className="text-xs font-medium text-[var(--muted)] sm:text-sm">
          View template:
        </p>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(LABELS) as StudioTemplateId[]).map((id) => {
            const selected = id === active;
            return (
              <Link
                key={id}
                href={demoTemplatePath(id)}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition sm:text-sm ${
                  selected
                    ? "bg-[var(--field)] text-white"
                    : "border border-[var(--line)] text-[var(--field)] hover:border-[var(--leaf)]"
                }`}
              >
                {LABELS[id]}
              </Link>
            );
          })}
        </div>
        <Link
          href="/signup"
          className="text-xs font-semibold text-[var(--leaf-dark)] underline sm:text-sm"
        >
          Build your own store with Vendl
        </Link>
      </div>
    </div>
  );
}
