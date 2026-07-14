const STYLE_PROPS = new Set([
  "color",
  "background-color",
  "font-size",
  "font-family",
  "font-weight",
  "font-style",
  "text-align",
  "text-decoration",
  "text-transform",
  "letter-spacing",
  "line-height",
  "margin",
  "margin-top",
  "margin-bottom",
  "margin-left",
  "margin-right",
  "padding",
  "padding-top",
  "padding-bottom",
  "padding-left",
  "padding-right",
  "list-style-type",
  "list-style-position",
]);

function sanitizeStyleValue(prop: string, value: string): string | null {
  const v = value.trim().toLowerCase();
  if (!v || /expression|url\s*\(|javascript:|@import/i.test(v)) return null;
  if (prop === "color" || prop === "background-color") {
    if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(v)) return v;
    if (/^rgba?\([\d\s.,%]+\)$/.test(v)) return v;
    if (/^[a-z]+$/.test(v)) return v;
    return null;
  }
  if (
    prop === "font-size" ||
    prop === "letter-spacing" ||
    prop === "line-height" ||
    prop.startsWith("margin") ||
    prop.startsWith("padding")
  ) {
    if (/^\d+(\.\d+)?(px|em|rem|%|pt)$/.test(v)) return v;
    if (prop.startsWith("margin") || prop.startsWith("padding")) {
      if (/^(\d+(\.\d+)?(px|em|rem|%|pt)|0)(\s+(\d+(\.\d+)?(px|em|rem|%|pt)|0)){0,3}$/.test(v)) {
        return v;
      }
    }
    return null;
  }
  if (prop === "list-style-type") {
    if (/^(disc|circle|square|decimal|lower-alpha|upper-alpha|lower-roman|upper-roman|none)$/.test(v)) {
      return v;
    }
    return null;
  }
  if (prop === "list-style-position") {
    if (/^(inside|outside)$/.test(v)) return v;
    return null;
  }
  if (prop === "font-family") {
    if (/^[a-z0-9\s,"'\-]+$/i.test(value.trim())) return value.trim();
    return null;
  }
  if (prop === "font-weight") {
    if (/^(bold|bolder|normal|[1-9]00)$/.test(v)) return v;
    return null;
  }
  if (prop === "font-style") {
    if (/^(normal|italic|oblique)$/.test(v)) return v;
    return null;
  }
  if (prop === "text-align") {
    if (/^(left|right|center|justify)$/.test(v)) return v;
    return null;
  }
  if (prop === "text-decoration") {
    if (/^(none|underline|line-through)$/.test(v)) return v;
    return null;
  }
  if (prop === "text-transform") {
    if (/^(none|uppercase|lowercase|capitalize)$/.test(v)) return v;
    return null;
  }
  return null;
}

export function sanitizeStyleAttr(style: string): string {
  return style
    .split(";")
    .map((part) => {
      const idx = part.indexOf(":");
      if (idx < 0) return "";
      const prop = part.slice(0, idx).trim().toLowerCase();
      const value = part.slice(idx + 1).trim();
      if (!STYLE_PROPS.has(prop)) return "";
      const safe = sanitizeStyleValue(prop, value);
      return safe ? `${prop}: ${safe}` : "";
    })
    .filter(Boolean)
    .join("; ");
}
