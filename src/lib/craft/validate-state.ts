import type { SerializedNodes } from "@craftjs/core";
import { CRAFT_RESOLVER_NAMES } from "./section-registry";

const ALLOWED = new Set(CRAFT_RESOLVER_NAMES);

export function validateCraftNodes(nodes: SerializedNodes): {
  ok: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  for (const [id, node] of Object.entries(nodes)) {
    const name =
      typeof node.type === "string" ? node.type : node.type?.resolvedName;
    if (!name) {
      errors.push(`Node ${id} missing type`);
      continue;
    }
    if (!ALLOWED.has(name as (typeof CRAFT_RESOLVER_NAMES)[number])) {
      errors.push(`Unknown section type: ${name}`);
    }
  }

  return { ok: errors.length === 0, errors };
}
