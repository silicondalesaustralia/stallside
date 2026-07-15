import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { Bricolage_Grotesque, DM_Sans, Spline_Sans_Mono } from "next/font/google";
import { APP_DOMAIN, APP_NAME, APP_SEO_DESCRIPTION, APP_SEO_TITLE } from "@/lib/constants";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import NativeShellBootstrap from "@/components/NativeShellBootstrap";
import NavigationBusy from "@/components/NavigationBusy";
import "./globals.css";

const display = Bricolage_Grotesque({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

const body = DM_Sans({
  variable: "--font-body",
  subsets: ["latin"],
});

const mono = Spline_Sans_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  metadataBase: new URL(`https://${APP_DOMAIN}`),
  title: {
    default: APP_SEO_TITLE,
    template: `%s · ${APP_NAME}`,
  },
  description: APP_SEO_DESCRIPTION,
  openGraph: {
    type: "website",
    locale: "en_AU",
    url: `https://${APP_DOMAIN}`,
    siteName: APP_NAME,
    title: APP_SEO_TITLE,
    description: APP_SEO_DESCRIPTION,
  },
  twitter: {
    card: "summary",
    title: APP_SEO_TITLE,
    description: APP_SEO_DESCRIPTION,
  },
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: APP_NAME,
    statusBarStyle: "default",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: "/brand/app-icon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#17361f",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable} ${mono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans">
        <GoogleAnalytics />
        <NativeShellBootstrap />
        <Suspense fallback={null}>
          <NavigationBusy />
        </Suspense>
        {children}
      </body>
    </html>
  );
}
