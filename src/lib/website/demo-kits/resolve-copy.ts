/** Resolve `{businessName}` tokens in kit copy. Never leaves unresolved tokens. */
export function resolveKitText(
  template: string,
  businessName: string,
): string {
  return template.replaceAll("{businessName}", businessName);
}

export function resolveKitCopyFields<T extends Record<string, unknown>>(
  value: T,
  businessName: string,
): T {
  const out: Record<string, unknown> = {};
  for (const [key, entry] of Object.entries(value)) {
    if (typeof entry === "string") {
      out[key] = resolveKitText(entry, businessName);
    } else if (Array.isArray(entry)) {
      out[key] = entry.map((item) => {
        if (typeof item === "string") return resolveKitText(item, businessName);
        if (item && typeof item === "object") {
          return resolveKitCopyFields(item as Record<string, unknown>, businessName);
        }
        return item;
      });
    } else if (entry && typeof entry === "object") {
      out[key] = resolveKitCopyFields(
        entry as Record<string, unknown>,
        businessName,
      );
    } else {
      out[key] = entry;
    }
  }
  return out as T;
}
