export const MAX_OPTION_GROUPS = 3;
export const MAX_CHOICES_PER_GROUP = 12;
export const MAX_OPTION_NAME_LEN = 40;

export type PublicOptionChoice = {
  id: string;
  name: string;
  priceDeltaCents: number;
};

export type PublicOptionGroup = {
  id: string;
  name: string;
  choices: PublicOptionChoice[];
};

export type OptionGroupInput = {
  name: string;
  choices: { name: string; priceDeltaCents: number }[];
};

export function cartLineKey(productId: string, choiceIds: string[]): string {
  return `${productId}|${choiceIds.join(",")}`;
}

export function formatOptionsSnapshot(
  groups: { name: string; choiceName: string }[],
): string | null {
  if (groups.length === 0) return null;
  return groups.map((g) => `${g.name}: ${g.choiceName}`).join(" · ");
}

/**
 * Unit price for a line with selected option prices.
 * One group: choice price is absolute (0 = use product base).
 * Multiple groups: product base + each selected choice as an add-on.
 */
export function unitPriceWithOptions(
  baseCents: number,
  selectedChoicePrices: number[],
): number {
  if (selectedChoicePrices.length === 0) return baseCents;
  if (selectedChoicePrices.length === 1) {
    const price = selectedChoicePrices[0] ?? 0;
    return price > 0 ? price : baseCents;
  }
  return baseCents + selectedChoicePrices.reduce((s, d) => s + d, 0);
}

/** Validate owner-submitted option groups (replace-all payload). */
export function parseOptionGroupsInput(
  raw: unknown,
): { ok: true; groups: OptionGroupInput[] } | { ok: false; error: string } {
  if (!Array.isArray(raw)) {
    return { ok: false, error: "Invalid options payload." };
  }
  if (raw.length > MAX_OPTION_GROUPS) {
    return { ok: false, error: `At most ${MAX_OPTION_GROUPS} option groups.` };
  }
  const groups: OptionGroupInput[] = [];
  for (const g of raw) {
    if (!g || typeof g !== "object") {
      return { ok: false, error: "Invalid option group." };
    }
    const name = String((g as { name?: unknown }).name ?? "")
      .trim()
      .slice(0, MAX_OPTION_NAME_LEN);
    const choicesRaw = (g as { choices?: unknown }).choices;
    if (!name) return { ok: false, error: "Each option group needs a name." };
    if (!Array.isArray(choicesRaw) || choicesRaw.length === 0) {
      return { ok: false, error: `“${name}” needs at least one choice.` };
    }
    if (choicesRaw.length > MAX_CHOICES_PER_GROUP) {
      return {
        ok: false,
        error: `“${name}” can have at most ${MAX_CHOICES_PER_GROUP} choices.`,
      };
    }
    const choices: OptionGroupInput["choices"] = [];
    for (const c of choicesRaw) {
      if (!c || typeof c !== "object") {
        return { ok: false, error: `Invalid choice in “${name}”.` };
      }
      const choiceName = String((c as { name?: unknown }).name ?? "")
        .trim()
        .slice(0, MAX_OPTION_NAME_LEN);
      const delta = Number((c as { priceDeltaCents?: unknown }).priceDeltaCents);
      if (!choiceName) {
        return { ok: false, error: `A choice in “${name}” needs a name.` };
      }
      if (!Number.isInteger(delta) || delta < 0 || delta > 1_000_000) {
        return {
          ok: false,
          error: `Price add-on for “${choiceName}” must be a whole number ≥ 0.`,
        };
      }
      choices.push({ name: choiceName, priceDeltaCents: delta });
    }
    groups.push({ name, choices });
  }
  return { ok: true, groups };
}
