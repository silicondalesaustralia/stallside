import Image from "next/image";
import HomeCalendarShot from "@/components/home/HomeCalendarShot";
import HomeEditorShot from "@/components/home/HomeEditorShot";
import HomeEmailShot from "@/components/home/HomeEmailShot";
import HomeSocialCreateShot from "@/components/home/HomeSocialCreateShot";
import HomeStandPoster from "@/components/home/HomeStandPoster";
import { HOME_HEADING_FONT, HOME_SCREEN_CAPTION } from "@/components/home/home-styles";
import type { FeatureVisual as VisualKind } from "@/lib/features/types";

function Frame({ children, caption }: { children: React.ReactNode; caption: string }) {
  return (
    <div>
      {children}
      <span className={HOME_SCREEN_CAPTION}>{caption}</span>
    </div>
  );
}

function GenericPanel({ title }: { title: string }) {
  return (
    <div
      aria-hidden
      className="overflow-hidden rounded-lg border border-[var(--line)] bg-white shadow-[0_8px_25px_#17361f16]"
    >
      <div className="border-b border-[var(--line)] bg-[var(--panel)] px-4 py-3 text-[11px] font-semibold text-[var(--field)]">
        Inside Vendl
      </div>
      <div className="space-y-3 p-5">
        <p className={`${HOME_HEADING_FONT} text-2xl text-[var(--field)]`}>{title}</p>
        <div className="h-2 w-3/4 rounded bg-[var(--wash)]" />
        <div className="h-2 w-1/2 rounded bg-[var(--wash)]" />
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <div className="rounded-md border border-[var(--line)] bg-[var(--wash)] p-3 text-[11px] text-[var(--muted)]">
            Live in your dashboard
          </div>
          <div className="rounded-md border border-[var(--line)] bg-[var(--wash)] p-3 text-[11px] text-[var(--muted)]">
            Works with your shop &amp; stall
          </div>
        </div>
      </div>
    </div>
  );
}

function PaymentsPanel() {
  return (
    <div
      aria-hidden
      className="overflow-hidden rounded-lg border border-[var(--line)] bg-white p-5 shadow-[0_8px_25px_#17361f16]"
    >
      <p className="text-[11px] font-bold tracking-[0.12em] text-[var(--field)]">PAYMENT METHODS</p>
      <ul className="mt-4 grid grid-cols-2 gap-2 text-sm text-[var(--field)] sm:grid-cols-3">
        {["Stripe", "Square", "PayPal", "Apple Pay", "PayID", "Cash"].map((label) => (
          <li key={label} className="rounded-md border border-[var(--line)] bg-[var(--wash)] px-3 py-2 text-center text-xs font-semibold">
            {label}
          </li>
        ))}
      </ul>
    </div>
  );
}

function CostingPanel() {
  return (
    <div
      aria-hidden
      className="overflow-hidden rounded-lg border border-[var(--line)] bg-white shadow-[0_8px_25px_#17361f16]"
    >
      <div className="border-b border-[var(--line)] bg-[var(--panel)] px-4 py-3 text-[11px] font-semibold">
        Batch costing · Rosemary focaccia
      </div>
      <div className="space-y-2 p-4 text-sm">
        {[
          ["Materials", "$11.92"],
          ["Labour", "$30.00"],
          ["Overhead", "$4.00"],
          ["Per loaf + pack", "$4.74"],
        ].map(([label, value]) => (
          <div key={label} className="flex justify-between border-b border-[var(--line)] py-2 last:border-0">
            <span className="text-[var(--muted)]">{label}</span>
            <span className="font-semibold text-[var(--field)]">{value}</span>
          </div>
        ))}
        <p className="pt-2 text-xs text-[var(--muted)]">Margin example · 47.7% at the priced loaf</p>
      </div>
    </div>
  );
}

function StallPanel() {
  return (
    <div className="relative mr-4 sm:mr-8">
      <Image
        src="/lp/green-valley-eggs-stallside-stand.jpg"
        alt="Roadside honesty stand with a QR checkout poster"
        width={819}
        height={1024}
        sizes="(max-width: 768px) 100vw, 480px"
        className="h-[360px] w-full rounded-[6px_70px_6px_6px] object-cover md:h-[440px]"
      />
      <HomeStandPoster qrSrc={null} />
    </div>
  );
}

export default function FeatureVisual({
  kind,
  title,
}: {
  kind: VisualKind;
  title: string;
}) {
  switch (kind) {
    case "website":
      return (
        <Frame caption="Inside Vendl · website editor">
          <HomeEditorShot />
        </Frame>
      );
    case "calendar":
      return (
        <Frame caption="Inside Vendl · calendar">
          <HomeCalendarShot showSocial />
        </Frame>
      );
    case "email":
      return (
        <Frame caption="Inside Vendl · email campaign">
          <HomeEmailShot />
        </Frame>
      );
    case "social":
      return (
        <Frame caption="Inside Vendl · social create">
          <HomeSocialCreateShot />
        </Frame>
      );
    case "stall":
      return (
        <Frame caption="Stall poster over a roadside stand">
          <StallPanel />
        </Frame>
      );
    case "payments":
      return (
        <Frame caption="Providers and pay methods">
          <PaymentsPanel />
        </Frame>
      );
    case "costing":
      return (
        <Frame caption="Same costing maths as Vendl Pro">
          <CostingPanel />
        </Frame>
      );
    default:
      return (
        <Frame caption="Inside Vendl">
          <GenericPanel title={title} />
        </Frame>
      );
  }
}
