"use client";

import { useEffect, useId, useRef } from "react";
import { X } from "lucide-react";
import { HOME_EYEBROW, HOME_H3 } from "@/components/home/home-styles";
import type { PlanFeatureGroup } from "@/lib/home-plan-features";

type HomePlanFeaturesModalProps = {
  open: boolean;
  onClose: () => void;
  plan: string;
  title: string;
  intro: string;
  groups: PlanFeatureGroup[];
};

export default function HomePlanFeaturesModal({ open, onClose, plan, title, intro, groups }: HomePlanFeaturesModalProps) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    else if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      className="fixed inset-0 z-50 m-auto max-h-[min(88vh,820px)] w-[min(100%-2rem,64rem)] overflow-y-auto border border-[var(--line)] bg-[#faf9f5] p-0 text-[var(--field)] shadow-xl backdrop:bg-black/45"
      onClose={onClose}
      onClick={(event) => {
        if (event.target === dialogRef.current) onClose();
      }}
    >
      <div className="p-6 md:p-10">
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <p className={HOME_EYEBROW}>{plan}</p>
            <h2 id={titleId} className={`${HOME_H3} text-[26px] md:text-[30px]`}>
              {title}
            </h2>
            <p className="mt-2 text-sm text-[var(--muted)]">{intro}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-full p-2 text-[var(--muted)] hover:bg-black/5 hover:text-[var(--field)]"
          >
            <X aria-hidden className="size-5" />
          </button>
        </div>
        <div className="gap-10 sm:columns-2 lg:columns-3">
          {groups.map((group) => (
            <section key={group.heading} className="mb-8 break-inside-avoid">
              <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
                {group.heading}
              </h3>
              <ul className="space-y-2.5 text-sm">
                {group.items.map(({ label, icon: Icon }) => (
                  <li key={label} className="flex items-start gap-3">
                    <Icon aria-hidden className="mt-0.5 size-4 shrink-0 text-[var(--leaf)]" />
                    <span>{label}</span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </dialog>
  );
}
