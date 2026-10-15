/** Registrar phone numbers must be `+CC.NNNN` (country code, dot, number). */

const CALLING_CODES: Record<string, string> = {
  AU: "61",
  NZ: "64",
  US: "1",
  CA: "1",
  GB: "44",
  UK: "44",
  IE: "353",
  DE: "49",
  FR: "33",
  NL: "31",
  ES: "34",
  IT: "39",
};

/**
 * Accepts what people type (`0412 345 678`, `+61 412 345 678`, `+61412345678`, `0061…`)
 * and returns the registrar format, or null when it can't be read with confidence.
 */
export function registrarPhone(raw: string, country: string): string | null {
  const trimmed = raw.trim();
  const dotted = /^\+(\d{1,3})\.(\d{4,14})$/.exec(trimmed.replace(/[\s\-()]/g, ""));
  if (dotted) {
    const number = dotted[2].replace(/^0+/, "");
    return number.length >= 4 ? `+${dotted[1]}.${number}` : null;
  }

  const compact = trimmed.replace(/[\s\-().]/g, "").replace(/^00/, "+");
  if (!/^\+?\d+$/.test(compact)) return null;
  const code = CALLING_CODES[country.trim().toUpperCase()];
  if (!code) return null;

  let local: string;
  if (compact.startsWith("+")) {
    if (!compact.startsWith(`+${code}`)) return null;
    local = compact.slice(code.length + 1);
  } else {
    local = compact;
  }
  local = local.replace(/^0+/, "");
  return local.length >= 4 && local.length <= 14 ? `+${code}.${local}` : null;
}
