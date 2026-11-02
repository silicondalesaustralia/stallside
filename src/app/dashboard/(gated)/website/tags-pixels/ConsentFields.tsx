import type { TrackingConsentMode } from "@/lib/website/tracking/types";
import { tagsInputClass } from "./tags-styles";

export default function ConsentFields({
  consentMode,
  privacyNotice,
}: {
  consentMode: TrackingConsentMode;
  privacyNotice: boolean;
}) {
  return (
    <section>
      <p className="text-sm text-[var(--muted)]">
        Visitors who see the banner aren&apos;t tracked by ad pixels until they press Accept. Google tags use Consent
        Mode v2, so they only send cookieless pings until then.
      </p>
      <label className="mt-4 block text-sm">
        <span className="font-medium">Cookie banner</span>
        <select name="consentMode" defaultValue={consentMode} className={tagsInputClass.replace("font-mono ", "")}>
          <option value="eu">EU, EEA, UK and Swiss visitors only (recommended)</option>
          <option value="all">Every visitor</option>
          <option value="off">Off</option>
        </select>
      </label>
      <label className="mt-4 flex items-start gap-2 text-sm">
        <input type="checkbox" name="privacyNotice" defaultChecked={privacyNotice} className="mt-1" />
        <span>
          <span className="font-medium">List these services on my Privacy policy page</span>
          <span className="block text-xs text-[var(--muted)]">
            Adds an &quot;Analytics and advertising&quot; section naming each service you&apos;ve added, kept up to date
            automatically.
          </span>
        </span>
      </label>
    </section>
  );
}
