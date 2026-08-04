import Script from "next/script";

const PERFORM_SCRIPT_SRC =
  "https://perform-by-silicondales.vercel.app/api/attribution/script?orgId=59c53b3e-428d-4dd9-8b4d-5c34aa938818&siteId=all";

/** Sitewide Silicon Dales Perform attribution pixel. */
export default function PerformPixel() {
  return (
    <Script src={PERFORM_SCRIPT_SRC} strategy="afterInteractive" />
  );
}
