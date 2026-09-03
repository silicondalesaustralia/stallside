import type { Data } from "@puckeditor/core";
import type { Prisma } from "@/generated/prisma/client";
import {
  parseStorefrontConfig,
} from "@/lib/storefront/config";
import type { StorefrontConfig } from "@/lib/storefront/types";
import { PUCK_SPIKE_VERSION, type PuckSpikePayload } from "./types";

export type StorefrontConfigWithPuck = StorefrontConfig & {
  puckSpike?: PuckSpikePayload;
};

function isPuckData(raw: unknown): raw is Data {
  return Boolean(raw && typeof raw === "object" && "content" in raw);
}

export function extractPuckSpike(raw: unknown): PuckSpikePayload | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const spike = (raw as { puckSpike?: unknown }).puckSpike;
  if (!spike || typeof spike !== "object") return undefined;
  const obj = spike as Partial<PuckSpikePayload>;
  if (obj.version !== PUCK_SPIKE_VERSION || obj.engine !== "puck") return undefined;
  if (!isPuckData(obj.home)) return undefined;
  return {
    version: PUCK_SPIKE_VERSION,
    engine: "puck",
    home: obj.home,
  };
}

export function parseDraftConfigWithPuck(raw: unknown): StorefrontConfigWithPuck {
  const base = parseStorefrontConfig(raw);
  const puckSpike = extractPuckSpike(raw);
  return puckSpike ? { ...base, puckSpike } : base;
}

export function mergePuckSpikeIntoRaw(
  existingRaw: unknown,
  home: Data,
): Prisma.InputJsonValue {
  const base =
    existingRaw && typeof existingRaw === "object" && !Array.isArray(existingRaw)
      ? { ...(existingRaw as Record<string, unknown>) }
      : {};
  const puckSpike: PuckSpikePayload = {
    version: PUCK_SPIKE_VERSION,
    engine: "puck",
    home,
  };
  return { ...base, puckSpike } as Prisma.InputJsonValue;
}

export function readPuckHomeFromStorefrontJson(
  raw: unknown,
  usePublished: boolean,
  publishedRaw: unknown | null,
): Data | null {
  const source = usePublished && publishedRaw ? publishedRaw : raw;
  return extractPuckSpike(source)?.home ?? null;
}
