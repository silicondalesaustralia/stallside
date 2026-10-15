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

export default function ProfileHoursFields({ profile }: { profile: BusinessProfile }) {
  return (
    <details className="group rounded-xl border border-[var(--line)] p-4">
      <summary className="cursor-pointer list-none font-semibold text-[var(--field)]">
        <span className="mr-2 inline-block transition-transform group-open:rotate-90">›</span>
        Opening hours
      </summary>
      <p className="mt-2 text-xs text-[var(--muted)]">
        Leave a day blank when you&apos;re closed. Keep these the same as your Google Business Profile.
      </p>
      <div className="mt-4 space-y-2">
        {DAY_IDS.map((day) => (
          <div key={day} className="grid grid-cols-[6rem_1fr_1fr] items-center gap-2 text-sm">
            <span className="font-medium">{DAY_LABELS[day]}</span>
            <input
              type="time"
              name={`hours_${day}_opens`}
              aria-label={`${DAY_LABELS[day]} opens`}
              defaultValue={profile.hours?.[day]?.opens ?? ""}
              className={profileInputClass}
            />
            <input
              type="time"
              name={`hours_${day}_closes`}
              aria-label={`${DAY_LABELS[day]} closes`}
              defaultValue={profile.hours?.[day]?.closes ?? ""}
              className={profileInputClass}
            />
          </div>
        ))}
      </div>
    </details>
  );
}
