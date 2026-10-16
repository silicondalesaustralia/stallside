import Link from "next/link";
import WebsiteAssistant from "@/components/website-assistant/WebsiteAssistant";
import AssistantHowItWorks from "@/components/website-assistant/AssistantHowItWorks";
import { loadWizardData } from "@/lib/website-ai/assistant/load-wizard";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

export default async function WebsiteAssistantPage() {
  const data = await loadWizardData();
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-6">
      <div>
        <Link href="/dashboard/website/web-studio" className="text-sm text-[var(--muted)] underline">
          ← Website
        </Link>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-bold text-[var(--field)]">
          Create your website with AI
        </h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Answer a few questions and Vendl builds a draft website from your real details. You can edit everything afterwards.
        </p>
      </div>
      {data.activeJobId ? null : <AssistantHowItWorks editorHref={data.editorHref} />}
      <WebsiteAssistant data={data} />
    </main>
  );
}
