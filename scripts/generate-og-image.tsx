/**
 * Renders the default social share image for vendl.app marketing pages.
 * Stand and shop pages set their own images; this is only the site-wide fallback.
 *
 *   npx tsx scripts/generate-og-image.tsx
 */
import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

const WIDTH = 1200;
const HEIGHT = 630;
const OUT = join(process.cwd(), "public/brand/og-default.png");

const FIELD = "#17361f";
const INK_ON_DARK = "#eaf2e6";
const MARIGOLD = "#f5a623";

const FONT_CDN = "https://cdn.jsdelivr.net/fontsource/fonts";

async function loadFont(path: string): Promise<ArrayBuffer> {
  const res = await fetch(`${FONT_CDN}/${path}`);
  if (!res.ok) throw new Error(`Font fetch failed (${res.status}): ${path}`);
  return res.arrayBuffer();
}

function Mark({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <rect x="4" y="4" width="40" height="40" rx="12" stroke={INK_ON_DARK} strokeWidth="5" />
      <path d="M24 14c6 4 8 9 8 13a8 8 0 1 1-16 0c0-4 2-9 8-13z" fill={MARIGOLD} />
      <path d="M24 24v8" stroke={FIELD} strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

async function main() {
  const [display, body] = await Promise.all([
    loadFont("bricolage-grotesque@latest/latin-600-normal.woff"),
    loadFont("dm-sans@latest/latin-500-normal.woff"),
  ]);

  const image = new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: FIELD,
          backgroundImage:
            "radial-gradient(circle at 50% 38%, rgba(245,166,35,0.18) 0%, rgba(23,54,31,0) 55%)",
          color: INK_ON_DARK,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 36 }}>
          <Mark size={168} />
          <div
            style={{
              fontFamily: "Bricolage",
              fontSize: 200,
              fontWeight: 600,
              letterSpacing: "-0.03em",
              lineHeight: 1,
              marginTop: -18,
            }}
          >
            vendl
          </div>
        </div>
        <div
          style={{
            marginTop: 40,
            maxWidth: 940,
            textAlign: "center",
            fontFamily: "DM Sans",
            fontSize: 42,
            fontWeight: 500,
            lineHeight: 1.25,
            color: INK_ON_DARK,
            opacity: 0.9,
          }}
        >
          Make more money from your stall, micro bakery or home produce business
        </div>
        <div
          style={{
            marginTop: 18,
            fontFamily: "DM Sans",
            fontSize: 30,
            fontWeight: 500,
            color: MARIGOLD,
          }}
        >
          Shop included · No website needed · vendl.app
        </div>
      </div>
    ),
    {
      width: WIDTH,
      height: HEIGHT,
      fonts: [
        { name: "Bricolage", data: display, weight: 600, style: "normal" },
        { name: "DM Sans", data: body, weight: 500, style: "normal" },
      ],
    },
  );

  if (!image.ok) throw new Error(`Image render failed (${image.status})`);
  await writeFile(OUT, Buffer.from(await image.arrayBuffer()));
  console.log(`Wrote ${OUT}`);
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
