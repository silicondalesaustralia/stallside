import { DRAFT_CONFLICT_MESSAGE } from "@/lib/website/persistence/draft-store";
import { ADDRESS_LOCKED_MESSAGE } from "@/lib/storefront/web-address-copy";

export type WebStudioDetailsFlashState = {
  saved?: boolean;
  published?: boolean;
  unpublished?: boolean;
  restored?: boolean;
  error?: string;
};

const ERRORS: Record<string, string> = {
  headline: "Shop name is required.",
  slug: "Enter a valid URL slug.",
  slug_taken: "That URL is already in use. Try a different slug.",
  slug_locked: ADDRESS_LOCKED_MESSAGE,
  conflict: DRAFT_CONFLICT_MESSAGE,
  publish_blocked:
    "Your site can't be published yet: some sections still have example text such as \"Tell customers…\". Replace it in the layout editor, then publish again.",
  restore: "That version couldn't be restored. Reload and try again.",
  no_site:
    "There's no website to publish yet. Create it with AI, or build it in the front-end editor and publish from there.",
  website_stand: "Couldn't change the website stand. Reload and try again.",
};

export default function WebStudioDetailsFlash({ flash }: { flash?: WebStudioDetailsFlashState }) {
  if (!flash) return null;
  const ok = flash.saved
    ? "Saved to your draft. Publish to make the changes live."
    : flash.published
      ? "Site published."
      : flash.unpublished
        ? "Site unpublished."
        : flash.restored
          ? "That version is now your draft. Check it, then publish to make it live."
          : null;
  const error = flash.error ? ERRORS[flash.error] : undefined;

  return (
    <>
      {ok ? <p className="text-sm font-medium text-[var(--ok)]">{ok}</p> : null}
      {error ? <p className="text-sm font-medium text-[var(--gone)]">{error}</p> : null}
    </>
  );
}
