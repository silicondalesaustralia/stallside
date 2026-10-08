import type { NextConfig } from "next";

// Social kit: sharp/resvg Linux binaries and bundled fonts must be traced into
// the routes that load them, or those routes 500 on Vercel.
const SHARP_LINUX_NFT = [
  "./node_modules/@img/sharp-linux-x64/**",
  "./node_modules/@img/sharp-libvips-linux-x64/**",
];
const SOCIAL_FONTS_NFT = ["./src/lib/social/fonts/**"];
const SHARP_RESVG_NFT = [
  ...SOCIAL_FONTS_NFT,
  "./node_modules/@resvg/resvg-js-linux-x64-gnu/**",
  "./node_modules/@resvg/resvg-js/**",
  ...SHARP_LINUX_NFT,
];

const nextConfig: NextConfig = {
  serverExternalPackages: ["sharp", "@resvg/resvg-js"],
  outputFileTracingIncludes: {
    "/api/social/ai-image/generate": SHARP_LINUX_NFT,
    "/api/social/hybrid-render": SHARP_RESVG_NFT,
    "/api/social/inspiration-variants": SHARP_RESVG_NFT,
    "/api/social/inspiration-overlay": SHARP_RESVG_NFT,
    "/api/social/inspiration-photo-refine": SHARP_RESVG_NFT,
    "/api/social/inspiration-analyze": SHARP_LINUX_NFT,
    "/api/social/tiktok-slides": SHARP_RESVG_NFT,
    "/api/social/tiktok-media/[postId]/[index]": SHARP_LINUX_NFT,
    "/api/social/bundled-font/[file]": SOCIAL_FONTS_NFT,
  },
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
      { protocol: "https", hostname: "*.supabase.co", pathname: "/storage/v1/object/public/**" },
      { protocol: "https", hostname: "*.supabase.co", pathname: "/storage/v1/object/sign/**" },
      { protocol: "https", hostname: "images.unsplash.com" },
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
        source: "/testimonials",
        destination: "/testimonials-and-gallery",
        permanent: true,
      },
      {
        source: "/gallery",
        destination: "/testimonials-and-gallery",
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
