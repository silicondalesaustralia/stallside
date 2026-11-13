import { createHash } from "node:crypto";
import { getAuthSession } from "@/lib/session";

function emailHash(email: string) {
  return createHash("sha256").update(email.trim().toLowerCase()).digest("hex");
}

/** Hashed identity for the StitchStack script; must render before PerformPixel. */
export default async function StitchStackIdentity() {
  try {
    const session = await getAuthSession();
    const email = session?.user?.email;
    if (!email || session.impersonator) return null;
    return (
      <script
        id="stitchstack-identity"
        dangerouslySetInnerHTML={{
          __html: `window.sdIdentity={emailHash:"${emailHash(email)}"};`,
        }}
      />
    );
  } catch (error) {
    console.error("[stallside] StitchStack identity failed", error);
    return null;
  }
}
