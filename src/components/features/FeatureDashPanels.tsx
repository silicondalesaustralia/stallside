import Image from "next/image";
import { DashRow, FeatureChrome } from "@/components/features/FeatureChrome";
import { HOME_HEADING_FONT } from "@/components/home/home-styles";

const PRODUCTS = [
  { name: "Goat’s Milk Soap", src: "/gallery/fletchers-goats-milk-soap-bars.jpg", price: "$8.50" },
  { name: "Sourdough loaf", src: "/demo/kits/green-valley/packshot-sourdough.png", price: "$7.00" },
  { name: "Honey 500g", src: "/demo/kits/green-valley/packshot-honey.png", price: "$12.00" },
] as const;

export function ShopPanel() {
  return (
    <FeatureChrome path="/s/green-valley" caption="Shop link · product grid">
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {PRODUCTS.map((p) => (
          <div key={p.name} className="overflow-hidden rounded-md border border-[var(--line)]">
            <Image src={p.src} alt="" width={200} height={200} className="aspect-square w-full object-cover" />
            <div className="p-2">
              <p className="truncate text-[10px] font-semibold text-[var(--field)] sm:text-xs">{p.name}</p>
              <p className="text-[10px] text-[var(--muted)]">{p.price}</p>
            </div>
          </div>
        ))}
      </div>
    </FeatureChrome>
  );
}

export function InventoryPanel() {
  return (
    <FeatureChrome path="/dashboard/inventory" caption="Inside Vendl · inventory report">
      <p className={`${HOME_HEADING_FONT} mb-3 text-lg`}>Stock this week</p>
      <DashRow label="1 × Dozen Eggs" meta="3 left" tone="warn" />
      <DashRow label="Honey 500g" meta="2 left" tone="warn" />
      <DashRow label="Sourdough loaf" meta="18 in stock" />
      <DashRow label="Goat’s Milk Soap" meta="42 in stock" />
      <p className="mt-3 text-[11px] text-[var(--muted)]">Days of cover · sold 7 / 30 days · stock value</p>
    </FeatureChrome>
  );
}

export function OrdersPanel() {
  return (
    <FeatureChrome path="/dashboard/orders" caption="Inside Vendl · orders">
      <p className={`${HOME_HEADING_FONT} mb-3 text-lg`}>Today’s orders</p>
      <DashRow label="Jess M. · Card" meta="$15.00" />
      <DashRow label="Walk-up · Cash" meta="$10.00" />
      <DashRow label="Tom R. · Apple Pay" meta="$28.00" />
      <DashRow label="Pre-order · Sat collect" meta="$42.00" tone="mute" />
      <p className="mt-3 text-[11px] text-[var(--muted)]">Stall · shop · pre-orders · subscriptions</p>
    </FeatureChrome>
  );
}

export function CustomersPanel() {
  return (
    <FeatureChrome path="/dashboard/customers" caption="Inside Vendl · customers">
      <p className={`${HOME_HEADING_FONT} mb-3 text-lg`}>Smart lists</p>
      <DashRow label="Soap buyers · last 90 days" meta="214" />
      <DashRow label="Pre-order regulars" meta="38" />
      <DashRow label="Restock opt-ins" meta="56" tone="warn" />
      <DashRow label="All customers" meta="1,204" tone="mute" />
    </FeatureChrome>
  );
}

export function SuppliersPanel() {
  return (
    <FeatureChrome path="/dashboard/suppliers" caption="Inside Vendl · suppliers">
      <p className={`${HOME_HEADING_FONT} mb-3 text-lg`}>Supplier stock</p>
      <DashRow label="Hilltop Eggs · pending" meta="Approve" tone="warn" />
      <DashRow label="River Honey · on sale" meta="$186 owed" />
      <DashRow label="Oakwood Soap · on sale" meta="$42 owed" />
      <p className="mt-3 text-[11px] text-[var(--muted)]">Oldest stock sells first · Mark paid</p>
    </FeatureChrome>
  );
}

export function PreordersPanel() {
  return (
    <FeatureChrome path="/dashboard/pre-orders" caption="Inside Vendl · pre-order window">
      <div className="rounded-md border border-[var(--line)] bg-[var(--wash)] p-3">
        <p className="text-[10px] font-bold tracking-[0.12em] text-[var(--leaf)]">OPEN NOW</p>
        <p className={`${HOME_HEADING_FONT} mt-1 text-xl`}>Saturday bake</p>
        <p className="mt-1 text-xs text-[var(--muted)]">Closes Thu 8pm · Collect Sat 9–11am</p>
      </div>
      <div className="mt-3">
        <DashRow label="Sourdough · 24 ordered" meta="6 left" tone="warn" />
        <DashRow label="Focaccia · 18 ordered" meta="Open" />
        <DashRow label="Deposit taken" meta="12 orders" tone="mute" />
      </div>
    </FeatureChrome>
  );
}

export function SubscriptionsPanel() {
  return (
    <FeatureChrome path="/dashboard/subscriptions" caption="Inside Vendl · memberships">
      <p className={`${HOME_HEADING_FONT} mb-3 text-lg`}>Active plans</p>
      <DashRow label="Weekly veg box" meta="42 members" />
      <DashRow label="Soap club · monthly" meta="18 members" />
      <DashRow label="Skipped this week" meta="5" tone="mute" />
      <p className="mt-3 text-[11px] text-[var(--muted)]">Skip · pause · cancel — customer self-serve</p>
    </FeatureChrome>
  );
}

export function BundlesPanel() {
  return (
    <FeatureChrome path="/dashboard/products" caption="Inside Vendl · volume &amp; bundles">
      <div className="rounded-md border border-[var(--line)] p-3">
        <p className="text-sm font-semibold">Farm gate egg pack</p>
        <p className="mt-1 text-xs text-[var(--muted)]">1 dozen $9 · 2 dozen $16 · 4 dozen $28</p>
        <div className="mt-3 flex gap-2">
          <span className="rounded-full bg-[#ecfdf5] px-2 py-0.5 text-[10px] font-bold text-[#065f46]">Volume</span>
          <span className="rounded-full bg-[var(--wash)] px-2 py-0.5 text-[10px] font-bold text-[var(--muted)]">Bundle</span>
        </div>
      </div>
      <div className="mt-3 rounded-md border border-[var(--line)] p-3">
        <p className="text-sm font-semibold">Breakfast bundle</p>
        <p className="mt-1 text-xs text-[var(--muted)]">Eggs + sourdough + jam · $22 (save $4)</p>
      </div>
    </FeatureChrome>
  );
}

export function RestockPanel() {
  return (
    <FeatureChrome path="/dashboard/products" caption="Inside Vendl · restock alerts">
      <div className="rounded-md border border-[var(--line)] bg-[var(--wash)] p-3">
        <p className="text-sm font-semibold">Goat’s Milk &amp; Honey Soap</p>
        <p className="mt-1 text-xs text-[var(--muted)]">Sold out · 56 waiting</p>
        <button
          type="button"
          tabIndex={-1}
          className="mt-3 rounded-md bg-[var(--leaf)] px-3 py-1.5 text-[11px] font-bold text-white"
        >
          Mark restocked · notify
        </button>
      </div>
      <p className="mt-3 text-[11px] text-[var(--muted)]">Opt-in on the product page · alerts go out automatically</p>
    </FeatureChrome>
  );
}

export function DashboardHomePanel() {
  return (
    <FeatureChrome path="/dashboard" caption="Inside Vendl · business home">
      <div className="grid grid-cols-3 gap-2">
        {[
          ["Sales", "$1,328"],
          ["Orders", "64"],
          ["Low stock", "3"],
        ].map(([label, value]) => (
          <div key={label} className="rounded-md border border-[var(--line)] bg-[var(--wash)] p-2.5 text-center">
            <p className="text-[10px] text-[var(--muted)]">{label}</p>
            <p className={`${HOME_HEADING_FONT} text-lg text-[var(--field)]`}>{value}</p>
          </div>
        ))}
      </div>
      <div className="mt-3">
        <DashRow label="Jess M. paid" meta="12 min ago" />
        <DashRow label="Eggs low" meta="3 left" tone="warn" />
      </div>
    </FeatureChrome>
  );
}
