import type { SerializedNodes } from "@craftjs/core";
import type { Prisma } from "@/generated/prisma/client";
import { parseStorefrontConfig } from "@/lib/storefront/config";
import type { StorefrontConfig } from "@/lib/storefront/types";
import { CRAFT_SPIKE_VERSION, type CraftSpikePayload } from "./types";

export type StorefrontConfigWithCraft = StorefrontConfig & {
  craftSpike?: CraftSpikePayload;
};

function isSerializedNodes(raw: unknown): raw is SerializedNodes {
  if (!raw || typeof raw !== "object") return false;
  return Object.values(raw).every(
    (node) =>
      node &&
      typeof node === "object" &&
      "type" in node &&
      "props" in node,
  );
}

export function extractCraftSpike(raw: unknown): CraftSpikePayload | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const spike = (raw as { craftSpike?: unknown }).craftSpike;
  if (!spike || typeof spike !== "object") return undefined;
  const obj = spike as Partial<CraftSpikePayload>;
  if (obj.version !== CRAFT_SPIKE_VERSION || obj.engine !== "craft") return undefined;
  if (!isSerializedNodes(obj.nodes)) return undefined;
  return {
    version: CRAFT_SPIKE_VERSION,
    engine: "craft",
    nodes: obj.nodes,
  };
}

export function parseDraftConfigWithCraft(raw: unknown): StorefrontConfigWithCraft {
  const base = parseStorefrontConfig(raw);
  const craftSpike = extractCraftSpike(raw);
  return craftSpike ? { ...base, craftSpike } : base;
}

export function mergeCraftSpikeIntoRaw(
  existingRaw: unknown,
  nodes: SerializedNodes,
): Prisma.InputJsonValue {
  const base =
    existingRaw && typeof existingRaw === "object" && !Array.isArray(existingRaw)
      ? { ...(existingRaw as Record<string, unknown>) }
      : {};
  const craftSpike: CraftSpikePayload = {
    version: CRAFT_SPIKE_VERSION,
    engine: "craft",
    nodes,
  };
  return { ...base, craftSpike } as Prisma.InputJsonValue;
}

export function readCraftNodesFromStorefrontJson(
  raw: unknown,
  usePublished: boolean,
  publishedRaw: unknown | null,
): SerializedNodes | null {
  const source = usePublished && publishedRaw ? publishedRaw : raw;
  return extractCraftSpike(source)?.nodes ?? null;
}
