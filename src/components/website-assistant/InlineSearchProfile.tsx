"use client";

import { useState, useTransition, type FormEvent } from "react";
import { saveSearchProfileInline } from "@/app/dashboard/(gated)/website/assistant/profile-actions";
import type { BusinessProfile } from "@/lib/seo/business-profile";
import type { BusinessTypeId } from "@/lib/seo/business-types";
import ProfileIdentityFields from "@/components/website/search-profile/ProfileIdentityFields";
import ProfileLinksFields from "@/components/website/search-profile/ProfileLinksFields";
import ProfileLocationFields from "@/components/website/search-profile/ProfileLocationFields";
import ProfileHoursFields from "@/components/website/search-profile/ProfileHoursFields";
import ProfilePeopleFields from "@/components/website/search-profile/ProfilePeopleFields";
import { primaryButton, secondaryButton } from "./assistant-copy";

type Props = {
  profile: BusinessProfile;
  defaultType: BusinessTypeId;
  initial: { complete: boolean; summary: string[] };
};

/** Optional Google & search profile, edited inline so the owner stays in the assistant. */
export default function InlineSearchProfile({ profile: initialProfile, defaultType, initial }: Props) {
  const [profile, setProfile] = useState(initialProfile);
  const [status, setStatus] = useState(initial);
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [saving, start] = useTransition();

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    start(async () => {
      const res = await saveSearchProfileInline(data);
      if (!res.ok) {
        setMessage({ ok: false, text: res.error });
        return;
      }
      setProfile(res.profile);
      setStatus({ complete: res.complete, summary: res.summary });
      setMessage({ ok: true, text: "Search profile saved." });
      setOpen(false);
    });
  };

  return (
    <section className="space-y-3 rounded-xl border border-[var(--line)] bg-white p-4 text-sm">
      <div>
        <h3 className="font-semibold text-[var(--field)]">Google &amp; search profile (optional)</h3>
        <p className="mt-1 text-[var(--muted)]">
          You don&apos;t have to fill this in. It gives the AI builder more context — your business type, location,
          opening hours and what you&apos;re known for — and once your site is published it tells Google and other
          search engines how to show your business in Maps and search results.
        </p>
      </div>
      {status.summary.length > 0 ? (
        <div className="text-xs text-[var(--muted)]">
          <p className="font-medium text-[var(--field)]">The builder will use:</p>
          <ul className="mt-1 list-disc pl-5">
            {status.summary.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </div>
      ) : null}
      {message ? (
        <p className={message.ok ? "text-[var(--ok)]" : "text-[var(--gone)]"}>{message.text}</p>
      ) : null}
      {open ? (
        <form onSubmit={onSubmit} className="space-y-3">
          <ProfileIdentityFields profile={profile} defaultType={defaultType} />
          <ProfileLinksFields profile={profile} />
          <ProfileLocationFields profile={profile} />
          <ProfileHoursFields profile={profile} />
          <ProfilePeopleFields profile={profile} />
          <div className="flex flex-wrap gap-2">
            <button type="submit" className={primaryButton} disabled={saving}>
              {saving ? "Saving…" : "Save search profile"}
            </button>
            <button type="button" className={secondaryButton} disabled={saving} onClick={() => setOpen(false)}>
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button type="button" className={secondaryButton} onClick={() => setOpen(true)}>
          {status.complete ? "Edit search profile" : "Add search profile details"}
        </button>
      )}
    </section>
  );
}
