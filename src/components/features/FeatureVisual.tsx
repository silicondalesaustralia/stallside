import Image from "next/image";
import {
  BundlesPanel,
  CustomersPanel,
  DashboardHomePanel,
  InventoryPanel,
  OrdersPanel,
  PreordersPanel,
  RestockPanel,
  ShopPanel,
  SubscriptionsPanel,
  SuppliersPanel,
} from "@/components/features/FeatureDashPanels";
import { FeatureChrome } from "@/components/features/FeatureChrome";
import HomeCalendarShot from "@/components/home/HomeCalendarShot";
import HomeEditorShot from "@/components/home/HomeEditorShot";
import HomeEmailShot from "@/components/home/HomeEmailShot";
import HomePaymentTile from "@/components/home/HomePaymentTile";
import HomeProductEditorShot from "@/components/home/HomeProductEditorShot";
import HomeSocialCreateShot from "@/components/home/HomeSocialCreateShot";
import HomeStandPoster from "@/components/home/HomeStandPoster";
import { HOME_HEADING_FONT, HOME_SCREEN_CAPTION } from "@/components/home/home-styles";
import { HOME_PAYMENT_METHODS, HOME_PAYMENT_PROVIDERS } from "@/lib/home-payments";
import { resolveFeatureVisual } from "@/lib/features/visuals";

function Frame({ children, caption }: { children: React.ReactNode; caption: string }) {
  return (
    <div>
      {children}
      <span className={HOME_SCREEN_CAPTION}>{caption}</span>
    </div>
  );
}

function PaymentsPanel() {
  return (
    <FeatureChrome path="/dashboard/payments" caption="Providers and pay methods">
      <p className="mb-3 text-[11px] font-bold tracking-[0.12em] text-[var(--field)]">CONNECTED</p>
      <ul className="flex flex-wrap gap-2">
        {HOME_PAYMENT_PROVIDERS.map((mark) => (
          <HomePaymentTile key={mark.label} mark={mark} />
        ))}
      </ul>
      <p className="mb-3 mt-5 text-[11px] font-bold tracking-[0.12em] text-[var(--field)]">CUSTOMER METHODS</p>
      <ul className="flex flex-wrap gap-2">
        {HOME_PAYMENT_METHODS.slice(0, 8).map((mark) => (
          <HomePaymentTile key={mark.label} mark={mark} />
        ))}
      </ul>
    </FeatureChrome>
  );
}

function CostingPanel() {
  return (
    <FeatureChrome path="/dashboard/production" caption="Same costing maths as Vendl Pro">
      <p className={`${HOME_HEADING_FONT} mb-3 text-lg`}>Rosemary focaccia · batch of 10</p>
      {[
        ["Materials (incl. waste)", "$11.92"],
        ["Labour · 60 min", "$30.00"],
        ["Overhead", "$4.00"],
        ["Per loaf + pack", "$4.74"],
      ].map(([label, value]) => (
        <div key={label} className="flex justify-between border-b border-[var(--line)] py-2 text-sm last:border-0">
          <span className="text-[var(--muted)]">{label}</span>
          <span className="font-semibold text-[var(--field)]">{value}</span>
        </div>
      ))}
      <p className="mt-3 rounded-md bg-[#ecfdf5] px-3 py-2 text-xs font-semibold text-[#065f46]">
        Margin 47.7% · profit $5.01 each at priced loaf
      </p>
    </FeatureChrome>
  );
}

function StallPanel() {
  return (
    <Frame caption="Stall poster over a roadside stand">
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
    </Frame>
  );
}

function WebsitePanel() {
  return (
    <Frame caption="Inside Vendl · website editor + product page">
      <div className="relative pb-8 sm:pb-10">
        <HomeEditorShot />
        <HomeProductEditorShot />
      </div>
    </Frame>
  );
}

export default function FeatureVisual({ slug }: { slug: string; title?: string }) {
  const kind = resolveFeatureVisual(slug);

  switch (kind) {
    case "website":
      return <WebsitePanel />;
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
      return <StallPanel />;
    case "payments":
      return <PaymentsPanel />;
    case "costing":
      return <CostingPanel />;
    case "shop":
      return <ShopPanel />;
    case "inventory":
      return <InventoryPanel />;
    case "orders":
      return <OrdersPanel />;
    case "customers":
      return <CustomersPanel />;
    case "suppliers":
      return <SuppliersPanel />;
    case "preorders":
      return <PreordersPanel />;
    case "subscriptions":
      return <SubscriptionsPanel />;
    case "bundles":
      return <BundlesPanel />;
    case "restock":
      return <RestockPanel />;
    default:
      return <DashboardHomePanel />;
  }
}
