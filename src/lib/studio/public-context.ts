import type { SerializedNodes } from "@craftjs/core";
import type { StorefrontContext } from "@/lib/catalogue/storefront";
import { readStudioFromStorefrontJson, defaultTemplateId } from "./storage";
import {
  STUDIO_VERSION,
  type StudioMetadata,
  type StudioPayload,
  type StudioTemplateId,
} from "./types";

export type StudioPublicContext =
  | {
      active: true;
      studio: StudioPayload;
      templateId: StudioTemplateId;
      metadata: StudioMetadata;
    }
  | { active: false };

export type StudioPublicOverride = {
  templateId?: StudioTemplateId;
  nodes?: SerializedNodes;
};

export async function resolveStudioPublicContext(
  ctx: NonNullable<StorefrontContext>,
  draft?: boolean,
  override?: StudioPublicOverride,
): Promise<StudioPublicContext> {
  const usePublished = !draft && ctx.storefront.isPublished;
  const studio = readStudioFromStorefrontJson(
    ctx.storefront.draftConfig,
    usePublished,
    ctx.storefront.publishedConfig,
  );

  if (!studio?.nodes && !override?.nodes) {
    return { active: false };
  }

  const templateId =
    override?.templateId ??
    (studio
      ? defaultTemplateId(studio, ctx.businessMode)
      : ("artisan" as StudioTemplateId));
  const nodes = override?.nodes ?? studio!.nodes;
  const resolvedStudio: StudioPayload = {
    version: studio?.version ?? STUDIO_VERSION,
    engine: "craft",
    templateId,
    nodes,
    pageNodes: studio?.pageNodes,
  };

  const { buildStudioMetadata } = await import("./build-metadata");
  const metadata = await buildStudioMetadata(ctx, templateId, draft);

  return {
    active: true,
    studio: resolvedStudio,
    templateId,
    metadata,
  };
}

export function shopPageTitle(templateId: StudioTemplateId): string {
  return templateId === "farmhouse" ? "What's available" : "Shop";
}
