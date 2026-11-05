import MakersLpSocialCreateShot from "@/components/lp/makers/MakersLpSocialCreateShot";
import MakersLpVideoClipShot from "@/components/lp/makers/MakersLpVideoClipShot";
import { PRO_MONTHLY_ALLOWANCE } from "@/lib/socialCredits/packs";

/** Social demo with product previews; shown as coming soon until Social is live for the owner. */
export default function ProDemoSocial({ socialReady }: { socialReady: boolean }) {
  const { design, clip } = PRO_MONTHLY_ALLOWANCE;
  return (
    <article aria-labelledby="demo-social" className="dash-card flex flex-col gap-4 p-5">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h3 id="demo-social" className="text-lg font-semibold text-[var(--field)]">
            Turn what you make into content you can share
          </h3>
          {socialReady ? null : (
            <span className="rounded-full border border-[var(--line)] px-2 py-0.5 text-xs font-bold text-[var(--muted)]">
              COMING SOON
            </span>
          )}
        </div>
        <p className="mt-1 text-sm text-[var(--muted)]">
          {socialReady
            ? `Use ${design} design credits and ${clip} video clip credits each month to create promotional content, then refine clips with Vendl's video editor.`
            : "Social designs, AI video clips and the video editor aren't available on your account yet. We'll let you know when they are."}
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <figure className="flex flex-col gap-2">
          <MakersLpSocialCreateShot />
          <figcaption className="text-xs text-[var(--muted)]">Social designs · illustrative preview</figcaption>
        </figure>
        <figure className="flex flex-col gap-2">
          <MakersLpVideoClipShot />
          <figcaption className="text-xs text-[var(--muted)]">AI video clips · illustrative preview</figcaption>
        </figure>
      </div>
      {socialReady ? (
        <p className="text-sm text-[var(--muted)]">
          More ways to turn the products and making process you already have into promotional material. Monthly
          credits are limited; extra packs are available to buy.
        </p>
      ) : null}
    </article>
  );
}
