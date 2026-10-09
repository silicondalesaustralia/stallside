import { cookies } from "next/headers";
import type { SerializedNodes } from "@craftjs/core";
import type { StorefrontContext } from "@/lib/catalogue/storefront";
import {
  GREEN_VALLEY_DEMO_COOKIE,
  isGreenValleyDemoTemplate,
  isWebsiteDemoStorefrontSlug,
} from "@/lib/demo/green-valley/constants";
import { buildGreenValleyHomeNodes } from "@/lib/demo/green-valley/starter-nodes";
import { readStudioFromStorefrontJson, studioPageNodes } from "@/lib/studio/storage";
import type { StudioPublicOverride } from "@/lib/studio/public-context";
import type { StudioTemplateId } from "@/lib/studio/types";

/** Runtime-only template override for Green Valley public demos (never writes DB). */
export async function greenValleyDemoOverride(
  ctx: NonNullable<StorefrontContext>,
  opts?: { homeNodes?: boolean },
): Promise<StudioPublicOverride | undefined> {
  if (!isWebsiteDemoStorefrontSlug(ctx.storefront.slug)) return undefined;
  const jar = await cookies();
  const raw = jar.get(GREEN_VALLEY_DEMO_COOKIE)?.value;
  if (!isGreenValleyDemoTemplate(raw)) return undefined;

  const templateId = raw as StudioTemplateId;
  if (!opts?.homeNodes) return { templateId };

  const studio = readStudioFromStorefrontJson(
    ctx.storefront.draftConfig,
    true,
    ctx.storefront.publishedConfig,
  );
  const variantKey = templateId === "artisan" ? "home" : `__demo_${templateId}`;
  let nodes: SerializedNodes | undefined = studio
    ? studioPageNodes(studio, variantKey)
    : undefined;
  if (!nodes) nodes = buildGreenValleyHomeNodes(templateId);
  return { templateId, nodes };
}
