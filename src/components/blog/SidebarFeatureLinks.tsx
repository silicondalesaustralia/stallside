import Link from "next/link";
import SidebarSection from "./SidebarSection";

const FEATURES = [
  { href: "/stall", label: "Stall payments", body: "QR code payments at your roadside or market stall." },
  { href: "/pre-orders", label: "Pre-orders", body: "Take paid orders with pickup times and a make list." },
  { href: "/#pricing", label: "Pricing", body: "Free is $0 a month with every feature." },
  { href: "/demo", label: "Try the demo", body: "See a working stand before you sign up." },
] as const;

export default function SidebarFeatureLinks() {
  return (
    <SidebarSection title="Vendl features">
      <ul className="space-y-3 text-sm">
        {FEATURES.map((feature) => (
          <li key={feature.href}>
            <Link
              href={feature.href}
              className="font-semibold text-[var(--leaf-dark)] underline-offset-2 hover:underline"
            >
              {feature.label}
            </Link>
            <p className="mt-0.5 leading-snug text-[var(--muted)]">{feature.body}</p>
          </li>
        ))}
      </ul>
    </SidebarSection>
  );
}
