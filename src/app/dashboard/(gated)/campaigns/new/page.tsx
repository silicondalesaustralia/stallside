import Link from "next/link";
import { requireOwner } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { dashCtaClass } from "@/components/DashPrimaryCta";
import { createCampaignDraft } from "../actions";
import { CAMPAIGN_TEMPLATES } from "../campaign-templates";

export default async function NewCampaignPage({
  searchParams,
}: {
  searchParams: Promise<{ menuId?: string; template?: string }>;
}) {
  const { owner } = await requireOwner();
  const sp = await searchParams;
  const templateKey =
    sp.template && CAMPAIGN_TEMPLATES[sp.template] ? sp.template : "";
  const defaults = templateKey ? CAMPAIGN_TEMPLATES[templateKey] : null;

  const [segments, promotions, menus, products] = await Promise.all([
    prisma.customerSegment.findMany({
      where: { ownerId: owner.id, isActive: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    prisma.promotion.findMany({
      where: { ownerId: owner.id, isActive: true },
      orderBy: { code: "asc" },
      select: { id: true, code: true, name: true },
    }),
    prisma.menu.findMany({
      where: { ownerId: owner.id, isActive: true },
      orderBy: { title: "asc" },
      select: { id: true, title: true },
    }),
    prisma.product.findMany({
      where: { ownerId: owner.id, isArchived: false },
      orderBy: { name: "asc" },
      take: 200,
      select: { id: true, name: true },
    }),
  ]);

  return (
    <main className="mx-auto flex w-full max-w-xl flex-col gap-6">
      <div>
        <p className="text-sm text-[var(--muted)]">
          <Link href="/dashboard/campaigns" className="underline">
            Campaigns
          </Link>
        </p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">
          New campaign
        </h1>
      </div>

      <form
        action={createCampaignDraft}
        className="dash-card flex flex-col gap-4 p-5"
      >
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium">Template</span>
          <select
            name="templateKey"
            defaultValue={templateKey}
            className="rounded-lg border border-[var(--line)] bg-white px-3 py-2"
          >
            <option value="">Blank</option>
            {Object.entries(CAMPAIGN_TEMPLATES).map(([key, t]) => (
              <option key={key} value={key}>
                {t.label}
              </option>
            ))}
          </select>
        </label>

        <Field name="name" label="Campaign name" defaultValue={defaults?.name} required />
        <Field name="subject" label="Subject" defaultValue={defaults?.subject} required />
        <Field name="heading" label="Heading" defaultValue={defaults?.heading} />
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium">Body</span>
          <textarea
            name="body"
            rows={5}
            required
            defaultValue={defaults?.body}
            className="rounded-lg border border-[var(--line)] bg-white px-3 py-2"
          />
        </label>
        <Field name="ctaLabel" label="CTA label" defaultValue={defaults?.ctaLabel} />
        <Field name="ctaUrl" label="CTA URL" />

        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium">Audience</span>
          <select
            name="audienceType"
            defaultValue={sp.menuId ? "menu" : "all_marketing"}
            className="rounded-lg border border-[var(--line)] bg-white px-3 py-2"
          >
            <option value="all_marketing">All marketing opt-ins</option>
            <option value="segment">Saved segment</option>
            <option value="menu">Menu / drop purchasers</option>
            <option value="product">Product purchasers</option>
          </select>
        </label>
        <Select
          name="segmentId"
          label="Segment"
          options={segments.map((s) => ({ value: s.id, label: s.name }))}
        />
        <Select
          name="menuId"
          label="Menu"
          defaultValue={sp.menuId ?? ""}
          options={menus.map((m) => ({ value: m.id, label: m.title }))}
        />
        <Select
          name="productId"
          label="Product"
          options={products.map((p) => ({ value: p.id, label: p.name }))}
        />
        <Select
          name="promotionId"
          label="Promotion (optional)"
          emptyLabel="None"
          options={promotions.map((p) => ({
            value: p.id,
            label: `${p.code} — ${p.name}`,
          }))}
        />

        <button type="submit" className={dashCtaClass}>
          Save draft
        </button>
      </form>
    </main>
  );
}

function Field({
  name,
  label,
  defaultValue,
  required,
}: {
  name: string;
  label: string;
  defaultValue?: string;
  required?: boolean;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="font-medium">{label}</span>
      <input
        name={name}
        required={required}
        defaultValue={defaultValue}
        className="rounded-lg border border-[var(--line)] bg-white px-3 py-2"
      />
    </label>
  );
}

function Select({
  name,
  label,
  options,
  defaultValue,
  emptyLabel = "—",
}: {
  name: string;
  label: string;
  options: { value: string; label: string }[];
  defaultValue?: string;
  emptyLabel?: string;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="font-medium">{label}</span>
      <select
        name={name}
        defaultValue={defaultValue}
        className="rounded-lg border border-[var(--line)] bg-white px-3 py-2"
      >
        <option value="">{emptyLabel}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
