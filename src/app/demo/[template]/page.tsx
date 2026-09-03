import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  GREEN_VALLEY_DEMO_COOKIE,
  isGreenValleyDemoTemplate,
  websiteDemoStorefrontSlug,
} from "@/lib/demo";
import { loadStorefrontContext } from "@/lib/catalogue/storefront";
import { resolveStudioPublicContext } from "@/lib/studio/public-context";
import StudioPublicSections from "@/lib/studio/public-render";
import StudioPublicShell from "@/components/studio/shell/StudioPublicShell";
import DemoTemplateToolbar from "@/components/demo/DemoTemplateToolbar";
import { buildGreenValleyHomeNodes } from "@/lib/demo/green-valley/starter-nodes";
import type { StudioTemplateId } from "@/lib/studio/types";

export const metadata: Metadata = {
  title: "Green Valley website demo",
  robots: { index: false, follow: false },
};

export default async function DemoWebsiteTemplatePage({
  params,
}: {
  params: Promise<{ template: string }>;
}) {
  const { template: raw } = await params;
  if (!isGreenValleyDemoTemplate(raw)) notFound();
  const templateId = raw as StudioTemplateId;

  const slug = websiteDemoStorefrontSlug();
  const ctx = await loadStorefrontContext(slug);
  if (!ctx) {
    return (
      <main className="mx-auto max-w-lg px-5 py-16 text-center">
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold">
          Demo not ready
        </h1>
        <p className="mt-3 text-sm text-[var(--muted)]">
          Seed the Green Valley demo first:{" "}
          <code className="text-xs">npm run seed:green-valley-demo</code>
        </p>
        <Link href="/demo" className="mt-6 inline-block underline">
          Back to Demo
        </Link>
      </main>
    );
  }

  const nodes = buildGreenValleyHomeNodes(templateId);
  const studioCtx = await resolveStudioPublicContext(ctx, false, {
    templateId,
    nodes,
  });

  if (!studioCtx.active) notFound();

  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: `document.cookie=${JSON.stringify(
            `${GREEN_VALLEY_DEMO_COOKIE}=${templateId};path=/;max-age=86400;samesite=lax`,
          )}`,
        }}
      />
      <DemoTemplateToolbar active={templateId} />
      <StudioPublicShell metadata={studioCtx.metadata} activePage="home">
        <StudioPublicSections
          nodes={studioCtx.studio.nodes}
          metadata={studioCtx.metadata}
        />
        <div className="mx-auto max-w-[var(--studio-content-max)] px-4 pb-16 pt-4 text-center sm:px-8">
          <Link
            href={`/shop/${slug}/shop`}
            className="text-sm font-semibold underline opacity-80"
          >
            Continue into the full shop →
          </Link>
        </div>
      </StudioPublicShell>
    </>
  );
}
