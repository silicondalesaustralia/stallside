import Link from "next/link";
import { webStudioPath } from "@/lib/website/web-studio-nav";

export default function BrandingManagedByWebsite() {
  return (
    <section className="space-y-2 rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-4 text-sm">
      <h2 className="text-lg font-semibold">Branding lives in Web Studio</h2>
      <p className="text-[var(--muted)]">
        Your website is published, so your logo, colours and fonts come from Web Studio. They
        apply to your website, checkout and QR posters. Social links are under Business Details.
      </p>
      <Link
        href={webStudioPath("branding")}
        className="inline-block font-semibold text-[var(--leaf-dark)] underline"
      >
        Edit branding in Web Studio
      </Link>
    </section>
  );
}
