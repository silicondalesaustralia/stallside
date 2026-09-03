import type { Data } from "@puckeditor/core";
import type { SectionType } from "./section-registry";
import { canInsertSection } from "./section-registry";
import type { BusinessMode } from "@/lib/business-mode";
import { puckSpikeConfig } from "./spike-config";

export function defaultPropsForSection(type: SectionType): Record<string, unknown> {
  const component = puckSpikeConfig.components[type];
  return { ...(component?.defaultProps ?? {}) };
}

export function insertSectionItem(
  data: Data,
  type: SectionType,
  index: number,
): Data | null {
  const component = puckSpikeConfig.components[type];
  if (!component) return null;
  const content = [...(data.content ?? [])];
  content.splice(index, 0, {
    type,
    props: defaultPropsForSection(type),
  });
  return { ...data, content };
}

export function removeSectionAt(data: Data, index: number): Data {
  const content = [...(data.content ?? [])];
  content.splice(index, 1);
  return { ...data, content };
}

export function moveSection(
  data: Data,
  from: number,
  to: number,
): Data {
  const content = [...(data.content ?? [])];
  if (from < 0 || from >= content.length || to < 0 || to >= content.length) {
    return data;
  }
  const [item] = content.splice(from, 1);
  content.splice(to, 0, item);
  return { ...data, content };
}

export function validateInsert(
  data: Data,
  type: SectionType,
  businessMode: BusinessMode,
): boolean {
  return canInsertSection(data.content ?? [], type, businessMode);
}

import { sectionRule } from "./section-registry";

export function normaliseSingletons(data: Data): Data {
  const seen = new Set<string>();
  const content = (data.content ?? []).filter((item) => {
    const rule = sectionRule(item.type);
    if (!rule?.singleton) return true;
    if (seen.has(item.type)) return false;
    seen.add(item.type);
    return true;
  });
  return { ...data, content };
}
