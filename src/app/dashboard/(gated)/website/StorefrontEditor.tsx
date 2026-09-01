"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { dashCtaClass } from "@/components/DashPrimaryCta";
import {
  saveStorefrontDraft,
  publishStorefrontAction,
  unpublishStorefrontAction,
} from "./actions";
import {
  STOREFRONT_PAGE_IDS,
  STOREFRONT_THEME_PRESETS,
  type StorefrontConfig,
  type StorefrontPageId,
  type StorefrontSection,
  type StorefrontSectionId,
  type StorefrontThemePreset,
} from "@/lib/storefront/types";
import { storefrontSectionLabel } from "@/lib/storefront/config";
import { STOREFRONT_THEMES } from "@/lib/storefront/themes";
import type { BusinessMode } from "@/lib/business-mode";

type EditorProduct = { id: string; name: string };

type Props = {
  storefront: {
    slug: string;
    headline: string | null;
    subheadline: string | null;
    about: string | null;
    heroImageUrl: string | null;
    themePreset: string;
    isPublished: boolean;
    contactEmail: string | null;
    showPhone: boolean;
    publishedAt: Date | null;
  };
  owner: {
    businessName: string;
    contactEmail: string;
    businessMode: BusinessMode;
  };
  draftConfig: StorefrontConfig;
  onlineCount: number;
  previewBaseUrl: string;
  liveBaseUrl: string;
  products: EditorProduct[];
  saved?: boolean;
  published?: boolean;
  unpublished?: boolean;
  error?: string;
};

const TABS = ["content", "theme", "pages", "settings"] as const;
type Tab = (typeof TABS)[number];

function sectionVisible(id: StorefrontSectionId, mode: BusinessMode): boolean {
  if (id === "farm_stand") {
    return mode === "FARM_STAND" || mode === "BOTH";
  }
  return true;
}

export default function StorefrontEditor({
  storefront,
  owner,
  draftConfig: initialConfig,
  onlineCount,
  previewBaseUrl,
  liveBaseUrl,
  products,
  saved,
  published,
  unpublished,
  error,
}: Props) {
  const [mobilePane, setMobilePane] = useState<"edit" | "preview">("edit");
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">(
    "desktop",
  );
  const [tab, setTab] = useState<Tab>("content");
  const [config, setConfig] = useState<StorefrontConfig>(initialConfig);
  const [featuredIds, setFeaturedIds] = useState<string[]>(
    initialConfig.featuredProductIds ?? [],
  );

  const draftConfigJson = useMemo(
    () => JSON.stringify({ ...config, featuredProductIds: featuredIds }),
    [config, featuredIds],
  );

  const previewUrl = `${previewBaseUrl}?draft=1`;
  const liveUrl = liveBaseUrl;

  function toggleSection(id: StorefrontSectionId) {
    setConfig((c) => ({
      ...c,
      sections: c.sections.map((s) =>
        s.id === id ? { ...s, enabled: !s.enabled } : s,
      ),
    }));
  }

  function moveSection(id: StorefrontSectionId, dir: -1 | 1) {
    setConfig((c) => {
      const sorted = [...c.sections].sort((a, b) => a.order - b.order);
      const idx = sorted.findIndex((s) => s.id === id);
      const swap = idx + dir;
      if (idx < 0 || swap < 0 || swap >= sorted.length) return c;
      const next = sorted.map((s, i) => ({ ...s, order: i }));
      [next[idx], next[swap]] = [next[swap], next[idx]];
      return {
        ...c,
        sections: next.map((s, i) => ({ ...s, order: i })),
      };
    });
  }

  function togglePage(id: StorefrontPageId) {
    setConfig((c) => ({
      ...c,
      pages: {
        ...c.pages,
        [id]: { ...c.pages[id], enabled: !c.pages[id]?.enabled },
      },
    }));
  }

  function toggleFeatured(productId: string) {
    setFeaturedIds((ids) =>
      ids.includes(productId)
        ? ids.filter((x) => x !== productId)
        : [...ids, productId].slice(0, 8),
    );
  }

  const sortedSections = [...config.sections].sort(
    (a, b) => a.order - b.order,
  );

  const editorPanel = (
    <div className="flex h-full flex-col">
      <div className="flex gap-1 border-b border-[var(--line)] p-2">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`rounded-lg px-3 py-2 text-xs font-semibold capitalize sm:text-sm ${
              tab === t
                ? "bg-[var(--field)] text-white"
                : "text-[var(--muted)] hover:bg-[var(--wash)]"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <form action={saveStorefrontDraft} className="flex flex-1 flex-col overflow-hidden">
        <input type="hidden" name="draftConfig" value={draftConfigJson} />
        <div className="flex-1 overflow-y-auto p-4">
          {tab === "content" ? (
            <div className="flex flex-col gap-5">
              <fieldset className="flex flex-col gap-3">
                <legend className="text-sm font-bold text-[var(--field)]">
                  Identity
                </legend>
                <label className="flex flex-col gap-1 text-sm">
                  <span className="font-medium">Shop name</span>
                  <input
                    name="headline"
                    required
                    defaultValue={storefront.headline ?? owner.businessName}
                    className="rounded-lg border border-[var(--line)] bg-white px-3 py-2.5"
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm">
                  <span className="font-medium">Tagline</span>
                  <input
                    name="subheadline"
                    defaultValue={storefront.subheadline ?? ""}
                    placeholder="Fresh eggs & produce, picked daily"
                    className="rounded-lg border border-[var(--line)] bg-white px-3 py-2.5"
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm">
                  <span className="font-medium">About</span>
                  <textarea
                    name="about"
                    rows={3}
                    defaultValue={storefront.about ?? ""}
                    className="rounded-lg border border-[var(--line)] bg-white px-3 py-2.5"
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm">
                  <span className="font-medium">Hero image</span>
                  {storefront.heroImageUrl ? (
                    <p className="text-xs text-[var(--muted)]">
                      Current hero saved. Upload to replace.
                    </p>
                  ) : null}
                  <input
                    type="file"
                    name="heroImage"
                    accept="image/jpeg,image/png,image/webp"
                    className="text-sm"
                  />
                  {storefront.heroImageUrl ? (
                    <label className="flex items-center gap-2 text-xs">
                      <input type="checkbox" name="removeHero" />
                      Remove hero image
                    </label>
                  ) : null}
                </label>
              </fieldset>

              <fieldset className="flex flex-col gap-2">
                <legend className="text-sm font-bold text-[var(--field)]">
                  Homepage sections
                </legend>
                {sortedSections
                  .filter((s) => sectionVisible(s.id, owner.businessMode))
                  .map((section, i, arr) => (
                    <SectionRow
                      key={section.id}
                      section={section}
                      onToggle={() => toggleSection(section.id)}
                      onUp={() => moveSection(section.id, -1)}
                      onDown={() => moveSection(section.id, 1)}
                      canUp={i > 0}
                      canDown={i < arr.length - 1}
                    />
                  ))}
              </fieldset>

              {products.length > 0 ? (
                <fieldset className="flex flex-col gap-2">
                  <legend className="text-sm font-bold text-[var(--field)]">
                    Featured products
                  </legend>
                  <p className="text-xs text-[var(--muted)]">
                    Pick up to 8 — leave empty to show your latest products.
                  </p>
                  {products.map((p) => (
                    <label
                      key={p.id}
                      className="flex items-center gap-2 text-sm"
                    >
                      <input
                        type="checkbox"
                        checked={featuredIds.includes(p.id)}
                        onChange={() => toggleFeatured(p.id)}
                      />
                      {p.name}
                    </label>
                  ))}
                </fieldset>
              ) : null}
            </div>
          ) : null}

          {tab === "theme" ? (
            <div className="flex flex-col gap-4">
              <p className="text-sm text-[var(--muted)]">
                Themes control colours and layout — your content stays the same.
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                {STOREFRONT_THEME_PRESETS.map((preset) => {
                  const theme = STOREFRONT_THEMES[preset];
                  return (
                    <label
                      key={preset}
                      className={`cursor-pointer rounded-xl border p-4 transition ${
                        storefront.themePreset === preset
                          ? "border-[var(--leaf)] ring-2 ring-[var(--leaf)]/30"
                          : "border-[var(--line)] hover:border-[var(--leaf)]"
                      }`}
                    >
                      <input
                        type="radio"
                        name="themePreset"
                        value={preset}
                        defaultChecked={storefront.themePreset === preset}
                        className="sr-only"
                      />
                      <div
                        className="mb-2 h-8 rounded-lg"
                        style={{
                          background: `linear-gradient(135deg, ${theme.accent}, ${theme.secondary})`,
                        }}
                      />
                      <p className="font-semibold text-[var(--field)]">
                        {theme.label}
                      </p>
                      <p className="mt-1 text-xs text-[var(--muted)]">
                        {theme.description}
                      </p>
                    </label>
                  );
                })}
              </div>
              <label className="flex flex-col gap-1 text-sm">
                <span className="font-medium">Accent colour override</span>
                <input
                  type="color"
                  defaultValue={
                    config.themeOverrides?.accentColor ??
                    STOREFRONT_THEMES[
                      (storefront.themePreset as StorefrontThemePreset) || "market"
                    ].accent
                  }
                  onChange={(e) =>
                    setConfig((c) => ({
                      ...c,
                      themeOverrides: {
                        ...c.themeOverrides,
                        accentColor: e.target.value,
                      },
                    }))
                  }
                />
              </label>
            </div>
          ) : null}

          {tab === "pages" ? (
            <div className="flex flex-col gap-3">
              {STOREFRONT_PAGE_IDS.map((pageId) => (
                <label
                  key={pageId}
                  className="flex items-center justify-between rounded-lg border border-[var(--line)] px-4 py-3 text-sm"
                >
                  <span className="font-medium capitalize">{pageId}</span>
                  <input
                    type="checkbox"
                    checked={config.pages[pageId]?.enabled !== false}
                    onChange={() => togglePage(pageId)}
                  />
                </label>
              ))}
              <label className="mt-2 flex flex-col gap-1 text-sm">
                <span className="font-medium">About page extra copy</span>
                <textarea
                  rows={4}
                  defaultValue={config.pages.about?.body ?? ""}
                  onChange={(e) =>
                    setConfig((c) => ({
                      ...c,
                      pages: {
                        ...c.pages,
                        about: { ...c.pages.about, enabled: c.pages.about?.enabled !== false, body: e.target.value },
                      },
                    }))
                  }
                  className="rounded-lg border border-[var(--line)] bg-white px-3 py-2.5"
                />
              </label>
            </div>
          ) : null}

          {tab === "settings" ? (
            <div className="flex flex-col gap-4">
              <label className="flex flex-col gap-1 text-sm">
                <span className="font-medium">Shop URL</span>
                <div className="flex items-center gap-2">
                  <span className="text-[var(--muted)]">/shop/</span>
                  <input
                    name="slug"
                    required
                    defaultValue={storefront.slug}
                    pattern="[a-z0-9-]+"
                    className="flex-1 rounded-lg border border-[var(--line)] bg-white px-3 py-2.5"
                  />
                </div>
              </label>
              <label className="flex flex-col gap-1 text-sm">
                <span className="font-medium">Contact email (public)</span>
                <input
                  name="contactEmail"
                  type="email"
                  defaultValue={
                    storefront.contactEmail ?? owner.contactEmail
                  }
                  className="rounded-lg border border-[var(--line)] bg-white px-3 py-2.5"
                />
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  name="showPhone"
                  defaultChecked={storefront.showPhone}
                />
                Show phone number on contact page
              </label>
              <p className="text-sm text-[var(--muted)]">
                {onlineCount} product{onlineCount === 1 ? "" : "s"} on your
                online shop.{" "}
                <Link href="/dashboard/products" className="underline">
                  Manage products
                </Link>
              </p>
              <Link
                href="/dashboard/website/domains"
                className="text-sm underline text-[var(--leaf-dark)]"
              >
                Custom domains — saved for later; DNS not connected yet
              </Link>
            </div>
          ) : null}
        </div>

        <div className="border-t border-[var(--line)] bg-[var(--panel)] p-4">
          <button type="submit" className={`w-full ${dashCtaClass}`}>
            Save draft
          </button>
        </div>
      </form>
    </div>
  );

  const previewPanel = (
    <div className="flex h-full flex-col bg-[var(--wash)]">
      <div className="flex items-center justify-between border-b border-[var(--line)] px-4 py-2">
        <span className="text-xs font-semibold text-[var(--muted)]">
          Live preview
        </span>
        <div className="flex gap-1">
          {(["desktop", "mobile"] as const).map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setPreviewDevice(d)}
              className={`rounded px-2 py-1 text-xs font-semibold capitalize ${
                previewDevice === d
                  ? "bg-[var(--field)] text-white"
                  : "text-[var(--muted)]"
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>
      <div className="flex flex-1 items-start justify-center overflow-auto p-4">
        <iframe
          key={previewUrl}
          title="Storefront preview"
          src={previewUrl}
          className={`h-[min(80vh,900px)] border border-[var(--line)] bg-white shadow-lg ${
            previewDevice === "mobile" ? "w-[390px] rounded-[2rem]" : "w-full max-w-4xl"
          }`}
        />
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight">
            Website editor
          </h1>
          <p className="mt-1 text-[var(--muted)]">
            Design your storefront — farm-stand QR links stay on{" "}
            <code className="text-xs">/s/…</code>.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {storefront.isPublished ? (
            <>
              <a
                href={liveUrl}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-[var(--line)] bg-white px-4 py-2 text-sm font-semibold"
              >
                View live site
              </a>
              <form action={unpublishStorefrontAction}>
                <button
                  type="submit"
                  className="rounded-full border border-[var(--line)] px-4 py-2 text-sm font-semibold text-[var(--muted)]"
                >
                  Unpublish
                </button>
              </form>
            </>
          ) : (
            <form action={publishStorefrontAction}>
              <button type="submit" className={dashCtaClass}>
                Publish
              </button>
            </form>
          )}
        </div>
      </div>

      {saved ? (
        <p className="text-sm text-[var(--leaf-dark)]">Draft saved.</p>
      ) : null}
      {published ? (
        <p className="text-sm text-[var(--leaf-dark)]">Storefront published.</p>
      ) : null}
      {unpublished ? (
        <p className="text-sm text-[var(--muted)]">Storefront unpublished.</p>
      ) : null}
      {error === "headline" ? (
        <p className="text-sm text-[var(--gone)]">Enter a shop name.</p>
      ) : null}
      {error === "slug" ? (
        <p className="text-sm text-[var(--gone)]">Enter a valid shop URL slug.</p>
      ) : null}

      <div className="flex gap-2 lg:hidden">
        <button
          type="button"
          onClick={() => setMobilePane("edit")}
          className={`flex-1 rounded-lg py-2 text-sm font-semibold ${
            mobilePane === "edit"
              ? "bg-[var(--field)] text-white"
              : "bg-[var(--wash)]"
          }`}
        >
          Edit
        </button>
        <button
          type="button"
          onClick={() => setMobilePane("preview")}
          className={`flex-1 rounded-lg py-2 text-sm font-semibold ${
            mobilePane === "preview"
              ? "bg-[var(--field)] text-white"
              : "bg-[var(--wash)]"
          }`}
        >
          Preview
        </button>
      </div>

      <div className="dash-card overflow-hidden lg:grid lg:h-[calc(100vh-14rem)] lg:min-h-[560px] lg:grid-cols-2">
        <div className={`${mobilePane === "preview" ? "hidden lg:block" : ""} min-h-[420px] lg:min-h-0`}>
          {editorPanel}
        </div>
        <div className={`${mobilePane === "edit" ? "hidden lg:block" : ""} min-h-[420px] lg:min-h-0`}>
          {previewPanel}
        </div>
      </div>

      {storefront.isPublished ? (
        <p className="text-sm text-[var(--muted)]">
          Live:{" "}
          <a href={liveUrl} target="_blank" rel="noreferrer" className="underline">
            {liveUrl}
          </a>
          {storefront.publishedAt
            ? ` · Published ${new Date(storefront.publishedAt).toLocaleDateString()}`
            : null}
        </p>
      ) : (
        <p className="text-sm text-[var(--muted)]">
          Preview:{" "}
          <a href={previewUrl} target="_blank" rel="noreferrer" className="underline">
            {previewUrl}
          </a>{" "}
          — publish when you&apos;re ready to go live.
        </p>
      )}
    </div>
  );
}

function SectionRow({
  section,
  onToggle,
  onUp,
  onDown,
  canUp,
  canDown,
}: {
  section: StorefrontSection;
  onToggle: () => void;
  onUp: () => void;
  onDown: () => void;
  canUp: boolean;
  canDown: boolean;
}) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-[var(--line)] bg-white px-3 py-2">
      <input
        type="checkbox"
        checked={section.enabled}
        onChange={onToggle}
        className="shrink-0"
      />
      <span className="flex-1 text-sm font-medium">
        {storefrontSectionLabel(section.id)}
      </span>
      <button
        type="button"
        disabled={!canUp}
        onClick={onUp}
        className="px-1 text-[var(--muted)] disabled:opacity-30"
        aria-label="Move up"
      >
        ↑
      </button>
      <button
        type="button"
        disabled={!canDown}
        onClick={onDown}
        className="px-1 text-[var(--muted)] disabled:opacity-30"
        aria-label="Move down"
      >
        ↓
      </button>
    </div>
  );
}
