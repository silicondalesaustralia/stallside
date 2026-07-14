import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, DM_Sans, Spline_Sans_Mono } from "next/font/google";
import { APP_DOMAIN, APP_NAME, APP_TAGLINE, APP_POSITIONING } from "@/lib/constants";
import NativeShellBootstrap from "@/components/NativeShellBootstrap";
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
    default: APP_NAME,
    template: `%s · ${APP_NAME}`,
  },
  description: `${APP_TAGLINE} ${APP_POSITIONING}`,
  appleWebApp: {
    capable: true,
    title: APP_NAME,
    statusBarStyle: "default",
  },
  icons: {
    icon: "/brand/app-icon.png",
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
        <NativeShellBootstrap />
        {children}
      </body>
    </html>
  );
}
