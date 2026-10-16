import { extractWebsiteStudio } from "@/lib/studio/storage";
import { assistantEnabledFor } from "./access";

/**
 * Assistant owners can't publish from Details until a site exists (built with AI or in the editor).
 * Sites that are already live are never locked.
 */
export function publishLockedForAssistant(
  ownerId: string,
  storefront: { isPublished: boolean; draftConfig: unknown },
): boolean {
  if (storefront.isPublished || !assistantEnabledFor(ownerId)) return false;
  return !extractWebsiteStudio(storefront.draftConfig)?.nodes;
}
