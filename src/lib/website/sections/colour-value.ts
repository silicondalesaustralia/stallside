/** Theme colours a seller can pick; anything else must be a #rrggbb colour. */
export const COLOUR_TOKENS = ["accent", "secondary", "wash", "panel", "dark", "light"] as const;
export type ColourToken = (typeof COLOUR_TOKENS)[number];

const HEX = /^#[0-9a-f]{6}$/i;

export function isColourValue(value: unknown): value is string {
  return (
    typeof value === "string" &&
    ((COLOUR_TOKENS as readonly string[]).includes(value) || HEX.test(value))
  );
}
