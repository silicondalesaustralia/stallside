import Script from "next/script";

/**
 * Persist Meta/Google click ids from the landing URL into a first-party cookie
 * before React hydrates, so OTP redirects cannot drop fbclid.
 */
export default function AdClickCapture() {
  return (
    <Script
      id="ss-ad-click-capture"
      src="/ad-click-capture.js"
      strategy="beforeInteractive"
    />
  );
}
