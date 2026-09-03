import type { ComponentData, Field } from "@puckeditor/core";
import {
  puckSpikeConfig,
  type PuckSpikeComponents,
} from "@/lib/puck/spike-config";

export type ResolvedSectionField = {
  key: string;
  label: string;
  field: Field;
};

type ResolveFieldsFn = (
  data: ComponentData,
  ctx: { fields: Record<string, Field> },
) => Record<string, Field>;

export function resolvedSectionFields(
  item: ComponentData,
): ResolvedSectionField[] {
  const type = item.type as keyof PuckSpikeComponents;
  const component = puckSpikeConfig.components[type];
  if (!component?.fields) return [];

  const baseFields = component.fields as unknown as Record<string, Field>;
  let fields = baseFields;

  const resolveFields = (component as { resolveFields?: ResolveFieldsFn })
    .resolveFields;
  if (resolveFields) {
    fields = resolveFields(item, { fields: baseFields });
  }

  return Object.entries(fields)
    .filter(([, field]) => field.visible !== false)
    .map(([key, field]) => ({
      key,
      label: field.label ?? key,
      field,
    }));
}
