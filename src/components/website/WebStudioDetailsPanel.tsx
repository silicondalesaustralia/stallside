import { dashCtaClass } from "@/components/DashPrimaryCta";
import {
  publishStorefrontAction,
  unpublishStorefrontAction,
} from "@/app/dashboard/(gated)/website/actions";
import ShopDetailsForm from "@/app/dashboard/(gated)/website/details/ShopDetailsForm";
import { storefrontPublicPath } from "@/lib/catalogue/storefront";
import type { ReactNode } from "react";
import WebStudioDetailsFlash, {
  type WebStudioDetailsFlashState,
} from "@/components/website/WebStudioDetailsFlash";

type Props = {
  headline: string;
  subheadline: string;
  about: string;
  slug: string;
  contactEmail: string;
  showPhone: boolean;
  isPublished: boolean;
  liveUrl: string;
  flash?: WebStudioDetailsFlashState;
  history?: ReactNode;
};

export default function WebStudioDetailsPanel({
  headline,
  subheadline,
  about,
  slug,
  contactEmail,
  showPhone,
  isPublished,
  liveUrl,
  flash,
  history,
}: Props) {
  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-[var(--field)]">
            Business details
          </h1>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Name, story, URL and contact — the facts AI and your storefront use.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {isPublished ? (
            <>
              <a
                href={liveUrl}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-[var(--line)] bg-white px-4 py-2 text-sm font-semibold"
              >
                View live site
              </a>
              <form action={publishStorefrontAction}>
                <button type="submit" className={dashCtaClass}>
                  Publish changes
                </button>
              </form>
              <form action={unpublishStorefrontAction}>
                <button
                  type="submit"
                  className="rounded-full border border-[var(--line)] px-4 py-2 text-sm font-semibold text-[var(--muted)]"
                >
                  Unpublish
                </button>
              </form>
            </>
          ) : (
            <form action={publishStorefrontAction}>
              <button type="submit" className={dashCtaClass}>
                Publish site
              </button>
            </form>
          )}
        </div>
      </div>

      <WebStudioDetailsFlash flash={flash} />

      <ShopDetailsForm
        headline={headline}
        subheadline={subheadline}
        about={about}
        slug={slug}
        contactEmail={contactEmail}
        showPhone={showPhone}
      />

      <p className="text-sm text-[var(--muted)]">
        Next: open the Branding tab above · Public path{" "}
        <code className="text-xs">{storefrontPublicPath(slug)}</code>
      </p>

      {history}
    </>
  );
}
