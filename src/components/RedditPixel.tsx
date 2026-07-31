import crypto from "node:crypto";
import Script from "next/script";
import { auth } from "@/lib/auth";

const REDDIT_PIXEL_ID = "a2_e8yaoiabudhk";

function sha256Hex(value: string) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

/** Sitewide Reddit Ads Pixel with hashed advanced matching when logged in. */
export default async function RedditPixel() {
  const session = await auth();
  const email = session?.user?.email?.trim().toLowerCase();
  const externalId = session?.user?.id?.trim();

  const match: Record<string, string> = {};
  if (email) match.email = sha256Hex(email);
  if (externalId) match.externalId = sha256Hex(externalId);

  const initExtra =
    Object.keys(match).length > 0 ? `, ${JSON.stringify(match)}` : "";

  return (
    <Script id="reddit-pixel" strategy="afterInteractive">
      {`
        !function(w,d){if(!w.rdt){var p=w.rdt=function(){p.sendEvent?p.sendEvent.apply(p,arguments):p.callQueue.push(arguments)};p.callQueue=[];var t=d.createElement("script");t.src="https://www.redditstatic.com/ads/pixel.js?pixel_id=${REDDIT_PIXEL_ID}",t.async=!0;var s=d.getElementsByTagName("script")[0];s.parentNode.insertBefore(t,s)}}(window,document);rdt('init','${REDDIT_PIXEL_ID}'${initExtra});rdt('track','PageVisit',{conversionId:'pv_'+crypto.randomUUID()});
      `}
    </Script>
  );
}
