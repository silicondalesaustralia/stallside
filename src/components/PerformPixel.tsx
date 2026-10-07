import Script from "next/script";

const PERFORM_SCRIPT_SRC =
  "https://stitchstack.app/api/attribution/script?orgId=59c53b3e-428d-4dd9-8b4d-5c34aa938818&siteId=1ce6a009-9689-4877-9e58-c07004f2bcaf&viewId=1ce6a009-9689-4877-9e58-c07004f2bcaf";

/** Sitewide Silicon Dales Perform attribution pixel. */
export default function PerformPixel() {
  return (
    <Script src={PERFORM_SCRIPT_SRC} strategy="afterInteractive" />
  );
}
