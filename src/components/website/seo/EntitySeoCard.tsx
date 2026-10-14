import { DRAFT_CONFLICT_MESSAGE } from "@/lib/website/persistence/draft-store";
import { websiteSectionEnabledFor } from "@/lib/website/access";
import { resolveSeoFields } from "@/lib/studio/seo-settings";
import { resolveEntitySeoContext } from "@/lib/website/seo/entity-context";
import { saveEntitySeo, type SeoFieldsVariant } from "@/lib/website/seo/save-entity-seo";
import SeoSettingsForm from "./SeoSettingsForm";

/**
 * Website "Search & social" settings for one page, product, category, post or offer.
 * Renders nothing for owners without the Website beta.
 */
export default async function EntitySeoCard({
  ownerId,
  businessName,
  entityKey,
  returnTo,
  status,
  variant = "all",
  anchor = true,
}: {
  ownerId: string;
  businessName: string;
  entityKey: string;
  /** Dashboard path to come back to after saving. */
  returnTo: string;
  /** The `seo` query value after a save. */
  status?: string;
  variant?: SeoFieldsVariant;
  /** Whether this card is the `#seo` scroll target (only one per screen). */
  anchor?: boolean;
}) {
  if (!websiteSectionEnabledFor(ownerId)) return null;
  const ctx = await resolveEntitySeoContext(ownerId, businessName, entityKey);
  if (!ctx) return null;
  const preview = resolveSeoFields(ctx.defaults, ctx.settings);

  return (
    <section id={anchor ? "seo" : undefined} className="scroll-mt-6 rounded-2xl border border-[var(--line)] bg-white p-5">
      <h2 className="font-semibold text-[var(--field)]">Search &amp; social</h2>
      <p className="mt-1 text-sm text-[var(--muted)]">
        How {ctx.pathLabel} appears in Google and when shared. Blank fields use smart defaults.
        Changes save to your website draft and go live when you publish.
      </p>
      {variant === "social" ? (
        <p className="mt-1 text-sm text-[var(--muted)]">
          The search title and description come from the search engine listing above.
        </p>
      ) : null}

      {status === "saved" ? (
        <p className="mt-3 text-sm font-medium text-[var(--ok)]">
          Search &amp; social saved to your draft. Publish your website to make it live.
        </p>
      ) : null}
      {status === "conflict" ? (
        <p className="mt-3 text-sm font-medium text-[var(--gone)]">{DRAFT_CONFLICT_MESSAGE}</p>
      ) : null}

      <div className="mt-4 rounded-xl border border-[var(--line)] bg-[var(--panel)] p-4 text-sm">
        <p className="truncate text-xs text-[#4d5156]">{ctx.pathLabel}</p>
        <p className="mt-1 truncate text-base text-[#1a0dab]">{preview.title}</p>
        <p className="mt-1 line-clamp-2 text-[#4d5156]">{preview.description}</p>
      </div>

      <details className="mt-4">
        <summary className="cursor-pointer text-sm font-semibold text-[var(--leaf-dark)] underline">
          Edit search &amp; social
        </summary>
        <div className="mt-4">
          <SeoSettingsForm
            action={saveEntitySeo.bind(null, entityKey, returnTo, variant)}
            defaults={ctx.defaults}
            settings={ctx.settings}
            showSearchFields={variant === "all"}
          />
        </div>
      </details>
    </section>
  );
}
