import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Default Server Action body limit is 1 MB; uploads need headroom for multipart.
  experimental: {
    serverActions: {
      bodySizeLimit: 6 * 1024 * 1024,
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
    ],
  },
  // Printed QR posters use stallside.app/s/{slug}. Keep those on stallside (no host
  // redirect) so they never depend on vendl DNS. Marketing host redirect lives in
  // middleware so /s, /checkout, /api stay on stallside.
  async redirects() {
    return [
      {
        source: "/pricing",
        destination: "/",
        permanent: true,
      },
      {
        source: "/farms-stand-news/stallside-vs-bakesy",
        destination: "/farms-stand-news/vendl-vs-bakesy",
        permanent: true,
      },
      {
        source: "/dashboard/stands",
        destination: "/dashboard/businesses",
        permanent: true,
      },
      {
        source: "/dashboard/stands/:path*",
        destination: "/dashboard/businesses/:path*",
        permanent: true,
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
