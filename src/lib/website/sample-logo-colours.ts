/** Client-side dominant colour sampling from a public logo URL. */

function rgbToHex(r: number, g: number, b: number): string {
  const to = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, "0");
  return `#${to(r)}${to(g)}${to(b)}`;
}

function saturation(r: number, g: number, b: number): number {
  const max = Math.max(r, g, b) / 255;
  const min = Math.min(r, g, b) / 255;
  if (max === min) return 0;
  const l = (max + min) / 2;
  return l > 0.5 ? (max - min) / (2 - max - min) : (max - min) / (max + min);
}

export async function sampleLogoColours(
  logoUrl: string,
): Promise<{ accent: string; secondary: string } | null> {
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.crossOrigin = "anonymous";
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error("logo load failed"));
      el.src = logoUrl;
    });

    const size = 64;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(img, 0, 0, size, size);
    const { data } = ctx.getImageData(0, 0, size, size);

    type Bucket = { r: number; g: number; b: number; n: number; sat: number };
    const buckets = new Map<string, Bucket>();

    for (let i = 0; i < data.length; i += 4) {
      const a = data[i + 3] ?? 0;
      if (a < 128) continue;
      const r = data[i] ?? 0;
      const g = data[i + 1] ?? 0;
      const b = data[i + 2] ?? 0;
      // Skip near-white / near-black
      const lum = (r + g + b) / 3;
      if (lum > 245 || lum < 18) continue;
      const key = `${r >> 4},${g >> 4},${b >> 4}`;
      const existing = buckets.get(key);
      if (existing) {
        existing.r += r;
        existing.g += g;
        existing.b += b;
        existing.n += 1;
      } else {
        buckets.set(key, { r, g, b, n: 1, sat: saturation(r, g, b) });
      }
    }

    const ranked = [...buckets.values()]
      .map((bucket) => ({
        r: bucket.r / bucket.n,
        g: bucket.g / bucket.n,
        b: bucket.b / bucket.n,
        n: bucket.n,
        sat: saturation(bucket.r / bucket.n, bucket.g / bucket.n, bucket.b / bucket.n),
      }))
      .sort((a, b) => b.sat * b.n - a.sat * a.n || b.n - a.n);

    if (ranked.length === 0) return null;
    const primary = ranked[0]!;
    const secondary =
      ranked.find((c) => {
        const dr = c.r - primary.r;
        const dg = c.g - primary.g;
        const db = c.b - primary.b;
        return Math.sqrt(dr * dr + dg * dg + db * db) > 60;
      }) ?? ranked[1] ?? primary;

    return {
      accent: rgbToHex(primary.r, primary.g, primary.b),
      secondary: rgbToHex(secondary.r, secondary.g, secondary.b),
    };
  } catch {
    return null;
  }
}
