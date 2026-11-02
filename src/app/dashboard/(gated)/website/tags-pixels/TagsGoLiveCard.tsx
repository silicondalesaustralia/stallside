import { TRACKING_FIELD_BY_KEY } from "@/lib/website/tracking/fields";
import type { TrackingIdKey, TrackingIds } from "@/lib/website/tracking/types";
import { publishTrackingLive } from "./actions";
import InstallCheckButton from "./InstallCheckButton";
import { tagsCardClass, tagsPrimaryButton, tagsSecondaryButton } from "./tags-styles";

export default function TagsGoLiveCard({
  sitePublished,
  inSync,
  liveIds,
  testUrl,
}: {
  sitePublished: boolean;
  inSync: boolean;
  liveIds: TrackingIds;
  testUrl: string;
}) {
  const checkLinks = (Object.keys(liveIds) as TrackingIdKey[])
    .map((key) => TRACKING_FIELD_BY_KEY.get(key))
    .filter((f): f is NonNullable<typeof f> => Boolean(f?.checkUrl));
  return (
    <section className={tagsCardClass}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-semibold text-[var(--field)]">Go live & validate</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            {!sitePublished
              ? "Publish your website first. Tags only run on your live site."
              : inSync
                ? "Your live website has the latest saved tags."
                : "You have saved changes that aren't live yet."}
          </p>
        </div>
        <form action={publishTrackingLive}>
          <button type="submit" disabled={!sitePublished || inSync} className={tagsPrimaryButton}>
            Make tags live
          </button>
        </form>
      </div>
      <ol className="mt-4 list-decimal space-y-3 pl-5 text-sm">
        <li>
          <span className="font-medium">Check installation.</span> Vendl loads your homepage and confirms each tag is there.
          <div className="mt-2">
            <InstallCheckButton />
          </div>
        </li>
        <li>
          <span className="font-medium">Watch events fire.</span> Test mode shows which tags loaded and each event
          sent as you browse and add to cart.
          <div className="mt-2">
            <a href={testUrl} target="_blank" rel="noopener noreferrer" className={`${tagsSecondaryButton} inline-block`}>
              Open website in test mode
            </a>
          </div>
        </li>
        <li>
          <span className="font-medium">Confirm on each platform.</span>
          {checkLinks.length === 0 ? (
            <span className="text-[var(--muted)]"> Links appear here once tags are live.</span>
          ) : (
            <ul className="mt-1 flex flex-wrap gap-2">
              {checkLinks.map((f) => (
                <li key={f.key}>
                  <a href={f.checkUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-[var(--field)] underline">
                    {f.label}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </li>
      </ol>
    </section>
  );
}
