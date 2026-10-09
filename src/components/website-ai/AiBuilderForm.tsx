"use client";

import { useActionState, useMemo, useState } from "react";
import Link from "next/link";
import {
  scaffoldAiWebsiteDraft,
  buildAiWebsiteDraft,
  type AiGenerateState,
} from "@/app/dashboard/(gated)/website/ai/actions";
import type { WebsiteContextAssessment } from "@/lib/website-ai/assess-context";
import type { CheckboxOption } from "@/lib/website-ai/capabilities";
import type { BrandLookCombo } from "@/lib/website/brand-looks";
import {
  recommendWebsiteBlueprint,
  type BlueprintRecommendation,
} from "@/lib/website/blueprints";
import { recommendDemoKit } from "@/lib/website/demo-kits";
import AiLookPicker from "./AiLookPicker";
import BlueprintStylePicker from "./BlueprintStylePicker";

const initial: AiGenerateState = { ok: false };

const inputClass =
  "mt-1 w-full rounded-md border border-[var(--border)] bg-white px-3 py-2 text-sm";

function CheckboxGroup({
  name,
  options,
  selected,
  onToggle,
}: {
  name: string;
  options: CheckboxOption[];
  selected: Set<string>;
  onToggle: (id: string) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      {options.map((opt) => {
        if (opt.id === "HOME") {
          return (
            <div key={opt.id} className="flex items-start gap-2 text-sm">
              <span
                className="mt-0.5 inline-flex size-4 shrink-0 items-center justify-center rounded border border-[var(--field)] bg-[var(--field)] text-[10px] font-bold text-white"
                aria-hidden
              >
                ✓
              </span>
              <span>
                <span className="font-medium text-[var(--field)]">{opt.label}</span>
                <span className="mt-0.5 block text-xs text-[var(--muted)]">
                  {opt.hint ?? "Always included"}
                  {opt.description ? ` — ${opt.description}` : ""}
                </span>
                <input type="hidden" name={name} value="HOME" />
              </span>
            </div>
          );
        }
        return (
          <label
            key={opt.id}
            className={`flex items-start gap-2 text-sm ${opt.disabled ? "opacity-50" : ""}`}
          >
            <input
              type="checkbox"
              name={name}
              value={opt.id}
              checked={selected.has(opt.id)}
              disabled={opt.disabled}
              onChange={() => onToggle(opt.id)}
              className="mt-0.5"
            />
            <span>
              <span className="font-medium text-[var(--field)]">{opt.label}</span>
              {opt.description ? (
                <span className="mt-0.5 block text-xs text-[var(--muted)]">
                  {opt.description}
                </span>
              ) : null}
              {opt.hint ? (
                <span className="mt-0.5 block text-xs text-[var(--muted)]">{opt.hint}</span>
              ) : null}
            </span>
          </label>
        );
      })}
    </div>
  );
}

export default function AiBuilderForm({
  assessment,
  previewPath,
  initialLooks = [],
  businessName: businessNameProp,
  logoUrl = null,
}: {
  assessment: WebsiteContextAssessment;
  previewPath: string;
  initialLooks?: BrandLookCombo[];
  businessName?: string;
  logoUrl?: string | null;
}) {
  const [scaffoldState, scaffoldAction, scaffoldPending] = useActionState(
    scaffoldAiWebsiteDraft,
    initial,
  );
  const [buildState, buildAction, buildPending] = useActionState(
    buildAiWebsiteDraft,
    initial,
  );
  const [blueprintId, setBlueprintId] = useState("vendl-choose");
  const [shapeOpen, setShapeOpen] = useState(true);
  const [pages, setPages] = useState(
    () => new Set(assessment.pageOptions.filter((p) => p.defaultChecked).map((p) => p.id)),
  );
  const [capabilities, setCapabilities] = useState(
    () =>
      new Set(
        assessment.capabilityOptions.filter((c) => c.defaultChecked).map((c) => c.id),
      ),
  );
  const looks = scaffoldState.looks?.length ? scaffoldState.looks : initialLooks;
  const [lookId, setLookId] = useState(looks[0]?.id ?? "");
  const showLookStep =
    (scaffoldState.ok && scaffoldState.phase === "scaffold") ||
    (looks.length > 0 && buildState.phase !== "built");
  const built = buildState.ok && buildState.phase === "built";
  const pending = scaffoldPending || buildPending;
  const error = buildState.error || scaffoldState.error;

  const recommendation: BlueprintRecommendation = useMemo(() => {
    if (scaffoldState.recommendedBlueprintId && scaffoldState.recommendationReason) {
      return {
        recommendedBlueprintId: scaffoldState.recommendedBlueprintId as BlueprintRecommendation["recommendedBlueprintId"],
        confidence: "medium",
        reasonCodes: ["GENERAL_ECOMMERCE"],
        userFacingReason: scaffoldState.recommendationReason,
      };
    }
    return recommendWebsiteBlueprint(
      {
        ownerId: "local",
        businessMode: "BOTH",
        businessName: scaffoldState.businessName ?? "Your shop",
        headline: scaffoldState.businessName ?? "Your shop",
        subheadline: null,
        about: null,
        regionLabel: null,
        hasFarmStand: assessment.knownFacts.includes("Farm stand"),
        hasMenus: assessment.knownFacts.includes("Weekly preorders"),
        hasDelivery: assessment.knownFacts.includes("Local delivery"),
        hasPickup: assessment.knownFacts.includes("Pickup"),
        productCount: assessment.knownFacts.includes("Your products") ? 4 : 0,
        categoryCount: 1,
        reviewCount: assessment.knownFacts.includes("Reviews") ? 2 : 0,
        categories: [],
        featuredProducts: [],
        productPhotoCount: assessment.knownFacts.includes("Brand images") ? 2 : 0,
        logoUrl: null,
        heroImageUrl: null,
        accentColor: null,
        secondaryColor: null,
        existingTemplateId: null,
        hasExistingStudio: false,
      },
      [...pages],
      { selectedPages: [...pages] },
    );
  }, [scaffoldState, assessment.knownFacts, pages]);

  const businessName =
    scaffoldState.businessName ?? businessNameProp ?? "Your shop";

  const showSamples = useMemo(
    () => capabilities.has("SHOP") && assessment.intake.showSampleProductsOption,
    [capabilities, assessment.intake.showSampleProductsOption],
  );

  const pageOptionsLive = useMemo(() => {
    return assessment.pageOptions.map((opt) => {
      if (opt.id === "SHOP") {
        return {
          ...opt,
          disabled: false,
          hint: capabilities.has("SHOP")
            ? undefined
            : "Also turns on Online shop / products",
        };
      }
      if (opt.id === "DELIVERY_POLICY") {
        return {
          ...opt,
          disabled: false,
          hint: capabilities.has("DELIVERY")
            ? undefined
            : "Also turns on Delivery under selling",
        };
      }
      return opt;
    });
  }, [assessment.pageOptions, capabilities]);

  const resolvedPreview = buildState.previewPath ?? previewPath;

  function toggle(set: Set<string>, id: string, locked?: boolean): Set<string> {
    if (locked || id === "HOME") return set;
    const next = new Set(set);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    return next;
  }

  function onTogglePage(id: string) {
    const locked = pageOptionsLive.find((p) => p.id === id)?.disabled;
    setPages((prev) => {
      const next = toggle(prev, id, locked);
      if (id === "SHOP" && next.has("SHOP")) {
        setCapabilities((caps) => {
          const c = new Set(caps);
          c.add("SHOP");
          return c;
        });
      }
      if (id === "DELIVERY_POLICY" && next.has("DELIVERY_POLICY")) {
        setCapabilities((caps) => {
          const c = new Set(caps);
          c.add("DELIVERY");
          return c;
        });
      }
      return next;
    });
  }

  function onToggleCapability(id: string) {
    const locked = assessment.capabilityOptions.find((c) => c.id === id)?.disabled;
    setCapabilities((prev) => {
      const next = toggle(prev, id, locked);
      if (id === "SHOP") {
        setPages((p) => {
          const pagesNext = new Set(p);
          if (next.has("SHOP")) pagesNext.add("SHOP");
          else pagesNext.delete("SHOP");
          return pagesNext;
        });
      }
      if (id === "DELIVERY") {
        setPages((p) => {
          const pagesNext = new Set(p);
          if (next.has("DELIVERY")) pagesNext.add("DELIVERY_POLICY");
          else pagesNext.delete("DELIVERY_POLICY");
          return pagesNext;
        });
      }
      return next;
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <p className="text-sm text-[var(--muted)]">
        We use your{" "}
        <Link href="/dashboard/website/web-studio?tab=details" className="underline">
          Website details
        </Link>
        , products, and fulfilment automatically. Pick pages below, then choose a starting
        style.
      </p>

      <form action={scaffoldAction} encType="multipart/form-data" className="flex flex-col gap-5">
        {assessment.siteShapeMode !== "skipped" ? (
          <div className="rounded-md border border-[var(--border)] px-4 py-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-medium text-[var(--field)]">
                What should this site include?
              </p>
              <button
                type="button"
                className="rounded-md border border-[var(--border)] bg-white px-3 py-1.5 text-sm font-medium text-[var(--field)] hover:border-[var(--field)]"
                onClick={() => setShapeOpen((v) => !v)}
              >
                {shapeOpen ? "Hide pages" : "Edit pages"}
              </button>
            </div>
            {!shapeOpen ? (
              <p className="mt-2 text-sm text-[var(--muted)]">{assessment.siteShapeSummary}</p>
            ) : (
              <div className="mt-4 grid gap-6 sm:grid-cols-2">
                <div>
                  <p className="mb-2 text-xs font-medium uppercase tracking-wide text-[var(--muted)]">
                    Pages
                  </p>
                  <CheckboxGroup
                    name="page"
                    options={pageOptionsLive}
                    selected={pages}
                    onToggle={onTogglePage}
                  />
                </div>
                <div>
                  <p className="mb-2 text-xs font-medium uppercase tracking-wide text-[var(--muted)]">
                    Selling capabilities
                  </p>
                  <CheckboxGroup
                    name="capability"
                    options={assessment.capabilityOptions}
                    selected={capabilities}
                    onToggle={onToggleCapability}
                  />
                </div>
              </div>
            )}
            {/* Ensure defaults submit when collapsed */}
            {!shapeOpen
              ? [...pages].map((id) => (
                  <input key={`p-${id}`} type="hidden" name="page" value={id} />
                ))
              : null}
            {!shapeOpen
              ? [...capabilities].map((id) => (
                  <input key={`c-${id}`} type="hidden" name="capability" value={id} />
                ))
              : null}
          </div>
        ) : (
          <>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm text-[var(--muted)]">
                Pages derived from your Vendl setup.
              </p>
              <button
                type="button"
                className="rounded-md border border-[var(--border)] bg-white px-3 py-1.5 text-sm font-medium text-[var(--field)] hover:border-[var(--field)]"
                onClick={() => setShapeOpen((v) => !v)}
              >
                {shapeOpen ? "Hide pages" : "Customise pages"}
              </button>
            </div>
            {shapeOpen ? (
              <div className="grid gap-6 rounded-md border border-[var(--border)] px-4 py-4 sm:grid-cols-2">
                <CheckboxGroup
                  name="page"
                  options={pageOptionsLive}
                  selected={pages}
                  onToggle={onTogglePage}
                />
                <CheckboxGroup
                  name="capability"
                  options={assessment.capabilityOptions}
                  selected={capabilities}
                  onToggle={onToggleCapability}
                />
              </div>
            ) : (
              <>
                {[...pages].map((id) => (
                  <input key={`p-${id}`} type="hidden" name="page" value={id} />
                ))}
                {[...capabilities].map((id) => (
                  <input key={`c-${id}`} type="hidden" name="capability" value={id} />
                ))}
              </>
            )}
          </>
        )}

        {showSamples ? (
          <div className="rounded-md border border-[var(--border)] px-4 py-4 text-sm">
            <label className="flex items-start gap-2">
              <input type="checkbox" name="sampleProducts" className="mt-0.5" />
              <span>
                <span className="font-medium text-[var(--field)]">
                  Show sample product cards while you add products
                </span>
                <span className="mt-0.5 block text-xs text-[var(--muted)]">
                  Editor only — samples can&apos;t be sold and are never shown to visitors.
                </span>
              </span>
            </label>
          </div>
        ) : null}

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-[var(--field)]">
            Anything you&apos;d like us to know?
          </span>
          <span className="text-xs text-[var(--muted)]">Optional</span>
          <textarea name="notes" rows={3} className={inputClass} />
        </label>

        {assessment.intake.askStory ? (
          <label className="block text-sm">
            <span className="font-medium text-[var(--field)]">
              In a sentence or two, what do you make or grow?
            </span>
            <textarea name="contextStory" rows={3} className={inputClass} />
            <span className="mt-1 block text-xs text-[var(--muted)]">Optional — you can skip</span>
          </label>
        ) : null}

        {assessment.intake.askArea ? (
          <label className="block text-sm">
            <span className="font-medium text-[var(--field)]">
              Which suburb or region do most of your customers come from?
            </span>
            <input name="contextArea" className={inputClass} />
            <span className="mt-1 block text-xs text-[var(--muted)]">
              Optional — used in copy only, never creates delivery zones
            </span>
          </label>
        ) : null}

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={pending}
            className="rounded-md bg-[var(--field)] px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            {scaffoldPending ? "Building scaffold…" : "Build scaffold"}
          </button>
          <Link href="/dashboard/website/web-studio?tab=studio" className="text-sm text-[var(--muted)] underline">
            Use classic editor instead
          </Link>
        </div>
      </form>

      {showLookStep && looks.length > 0 ? (
        <form action={buildAction} className="flex flex-col gap-6 rounded-md border border-[var(--border)] px-4 py-4">
          <p className="text-sm text-[var(--muted)]">
            {scaffoldState.summary ?? "Scaffold ready — choose a starting style, then a look."}
          </p>
          <BlueprintStylePicker
            selectedId={blueprintId}
            onSelect={setBlueprintId}
            recommendation={recommendation}
            businessName={businessName}
            logoUrl={logoUrl}
            defaultKitId={recommendDemoKit({
              hasFarmStand: assessment.knownFacts.includes("Farm stand"),
              hasMenus: assessment.knownFacts.includes("Weekly preorders"),
            })}
          />
          <input type="hidden" name="blueprintId" value={blueprintId} />
          <div className="border-t border-[var(--border)] pt-4">
            <AiLookPicker
              looks={looks}
              selectedId={lookId || looks[0]!.id}
              onSelect={setLookId}
            />
          </div>
          <button
            type="submit"
            disabled={pending || !(lookId || looks[0]?.id)}
            className="w-fit rounded-md bg-[var(--field)] px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            {buildPending ? "Building your website…" : "Build site"}
          </button>
        </form>
      ) : null}

      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
          <p className="font-medium">We couldn&apos;t finish this step.</p>
          <p className="mt-1">{error}</p>
        </div>
      ) : null}

      {built ? (
        <div className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-4 py-4 text-sm">
          <p className="font-medium text-[var(--field)]">✓ Your draft website is ready.</p>
          <p className="mt-1 text-[var(--muted)]">{buildState.summary}</p>
          {buildState.provider ? (
            <p className="mt-1 text-xs text-[var(--muted)]">
              {buildState.designSystem} · {buildState.provider}
            </p>
          ) : null}
          {buildState.missing?.length ? (
            <ul className="mt-3 list-disc pl-5 text-[var(--muted)]">
              {buildState.missing.map((m) => (
                <li key={m.code}>{m.message}</li>
              ))}
            </ul>
          ) : null}
          <div className="mt-4 flex flex-wrap gap-3">
            <a
              href={resolvedPreview}
              target="_blank"
              rel="noreferrer"
              className="rounded-md bg-[var(--field)] px-4 py-2 text-sm font-medium text-white"
            >
              Preview website
            </a>
            <Link
              href="/dashboard/website/web-studio?tab=studio"
              className="rounded-md border border-[var(--border)] px-4 py-2 text-sm"
            >
              Edit layout
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
