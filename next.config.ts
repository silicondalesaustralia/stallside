import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
    ],
  },
  // Permanent infrastructure: printed QR posters point at stallside.app/s/{slug}.
  // Do not remove. Stage 1 uses permanent: false (307); flip to true (301) after rebrand is verified.
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "stallside.app" }],
        destination: "https://vendl.app/:path*",
        permanent: false,
      },
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.stallside.app" }],
        destination: "https://vendl.app/:path*",
        permanent: false,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/lp/missed-sales",
        headers: [
          {
            key: "Cache-Control",
            value:
              "public, max-age=0, s-maxage=86400, stale-while-revalidate=604800",
          },
        ],
      },
      {
        source: "/lp/green-valley-eggs-stallside-stand.jpg",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/lp/green-valley-eggs-stallside-stand.webp",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
