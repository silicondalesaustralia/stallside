import Script from "next/script";

/** Sitewide Google Analytics (gtag.js). */
export default function GoogleAnalytics() {
  return (
    <>
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-PZG3J0PFEV"
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-VL6HJJKGXY');
          gtag('config', 'G-PZG3J0PFEV');
        `}
      </Script>
    </>
  );
}
