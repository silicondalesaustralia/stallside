import { SOCIAL_BETA } from "@/lib/beta-features";
import { setSocialBeta } from "./beta-actions";

export default function AdminBetaFeatures({
  ownerId,
  betaFeatures,
}: {
  ownerId: string;
  betaFeatures: string[];
}) {
  const socialOn = betaFeatures.includes(SOCIAL_BETA);
  const toggle = setSocialBeta.bind(null, ownerId, !socialOn);
  const allLive = process.env.SOCIAL_SECTION_LIVE === "1";

  return (
    <section className="dash-card space-y-3 p-5">
      <h2 className="text-lg font-semibold">Beta features</h2>
      <p className="text-sm text-[var(--muted)]">
        Social kit (Dashboard → Social): {socialOn ? "on" : "off"}.
        {allLive ? " SOCIAL_SECTION_LIVE=1 here, so every owner has it anyway." : ""}
      </p>
      <form action={toggle}>
        <button
          type="submit"
          className={
            socialOn
              ? "rounded-lg border border-[var(--line)] bg-white px-4 py-2 text-sm font-semibold"
              : "rounded-lg bg-[var(--leaf)] px-4 py-2 text-sm font-semibold text-white"
          }
        >
          {socialOn ? "Remove from Social beta" : "Add to Social beta"}
        </button>
      </form>
    </section>
  );
}
