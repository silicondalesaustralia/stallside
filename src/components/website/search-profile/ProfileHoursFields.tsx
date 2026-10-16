"use client";

import { useState } from "react";
import { DAY_IDS, type BusinessProfile, type DayId } from "@/lib/seo/business-profile";
import { profileInputClass } from "./ProfileField";

const DAY_LABELS: Record<DayId, string> = {
  mon: "Monday",
  tue: "Tuesday",
  wed: "Wednesday",
  thu: "Thursday",
  fri: "Friday",
  sat: "Saturday",
  sun: "Sunday",
};

type Hours = Record<DayId, { opens: string; closes: string }>;

function initialHours(profile: BusinessProfile): Hours {
  const out = {} as Hours;
  for (const day of DAY_IDS) {
    out[day] = { opens: profile.hours?.[day]?.opens ?? "", closes: profile.hours?.[day]?.closes ?? "" };
  }
  return out;
}

const filled = (h: { opens: string; closes: string }) => Boolean(h.opens && h.closes);

export default function ProfileHoursFields({ profile }: { profile: BusinessProfile }) {
  const [hours, setHours] = useState<Hours>(() => initialHours(profile));
  const source = DAY_IDS.find((day) => filled(hours[day]));

  const set = (day: DayId, key: "opens" | "closes", value: string) =>
    setHours((prev) => ({ ...prev, [day]: { ...prev[day], [key]: value } }));

  const fillDown = (days: readonly DayId[]) => {
    if (!source) return;
    setHours((prev) => {
      const next = { ...prev };
      for (const day of days) if (!filled(next[day])) next[day] = { ...prev[source] };
      return next;
    });
  };

  const clear = (day: DayId) => setHours((prev) => ({ ...prev, [day]: { opens: "", closes: "" } }));

  return (
    <details className="group rounded-xl border border-[var(--line)] p-4">
      <summary className="cursor-pointer list-none font-semibold text-[var(--field)]">
        <span className="mr-2 inline-block transition-transform group-open:rotate-90">›</span>
        Opening hours
      </summary>
      <p className="mt-2 text-xs text-[var(--muted)]">
        Leave a day blank when you&apos;re closed. Keep these the same as your Google Business Profile.
      </p>
      {source ? (
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          <button
            type="button"
            onClick={() => fillDown(DAY_IDS)}
            className="rounded-full border border-[var(--line)] px-3 py-1 font-medium"
          >
            Fill {DAY_LABELS[source]}&apos;s hours down to all empty days
          </button>
          <button
            type="button"
            onClick={() => fillDown(["mon", "tue", "wed", "thu", "fri"])}
            className="rounded-full border border-[var(--line)] px-3 py-1 font-medium"
          >
            Weekdays only
          </button>
        </div>
      ) : null}
      <div className="mt-4 space-y-2">
        {DAY_IDS.map((day) => (
          <div key={day} className="grid grid-cols-[6rem_1fr_1fr_auto] items-center gap-2 text-sm">
            <span className="font-medium">{DAY_LABELS[day]}</span>
            <input
              type="time"
              name={`hours_${day}_opens`}
              aria-label={`${DAY_LABELS[day]} opens`}
              value={hours[day].opens}
              onChange={(e) => set(day, "opens", e.target.value)}
              className={profileInputClass}
            />
            <input
              type="time"
              name={`hours_${day}_closes`}
              aria-label={`${DAY_LABELS[day]} closes`}
              value={hours[day].closes}
              onChange={(e) => set(day, "closes", e.target.value)}
              className={profileInputClass}
            />
            <button
              type="button"
              onClick={() => clear(day)}
              disabled={!hours[day].opens && !hours[day].closes}
              className="text-xs text-[var(--muted)] underline disabled:invisible"
              aria-label={`Mark ${DAY_LABELS[day]} closed`}
            >
              Closed
            </button>
          </div>
        ))}
      </div>
    </details>
  );
}
