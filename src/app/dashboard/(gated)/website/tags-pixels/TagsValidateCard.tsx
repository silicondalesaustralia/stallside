import { TRACKING_FIELD_BY_KEY } from "@/lib/website/tracking/fields";
import type { TrackingIdKey, TrackingIds } from "@/lib/website/tracking/types";
import InstallCheckButton from "./InstallCheckButton";
import { liveStatusText } from "./tags-data";
import { tagsCardClass, tagsSecondaryButton } from "./tags-styles";

export default function TagsValidateCard({
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
      <h2 className="font-semibold text-[var(--field)]">Validate your tags</h2>
      <p className="mt-1 text-sm text-[var(--muted)]">{liveStatusText(sitePublished, inSync)}</p>
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
