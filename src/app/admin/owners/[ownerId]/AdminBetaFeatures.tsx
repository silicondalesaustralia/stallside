import { BETA_APP_ACCESS } from "@/lib/beta-features";
import { setBetaAppAccess } from "./beta-actions";

export default function AdminBetaFeatures({
  ownerId,
  betaFeatures,
}: {
  ownerId: string;
  betaFeatures: string[];
}) {
  const on = betaFeatures.includes(BETA_APP_ACCESS);
  const toggle = setBetaAppAccess.bind(null, ownerId, !on);

  return (
    <section className="dash-card space-y-3 p-5">
      <h2 className="text-lg font-semibold">Beta app</h2>
      <p className="text-sm text-[var(--muted)]">
        Access to the beta app (Website studio, custom domains, Social and other new
        features): {on ? "on" : "off"}. Beta owners sign in at the beta address; everyone
        else stays on www.vendl.app.
      </p>
      <form action={toggle}>
        <button
          type="submit"
          className={
            on
              ? "rounded-lg border border-[var(--line)] bg-white px-4 py-2 text-sm font-semibold"
              : "rounded-lg bg-[var(--leaf)] px-4 py-2 text-sm font-semibold text-white"
          }
        >
          {on ? "Remove beta access" : "Give beta access"}
        </button>
      </form>
    </section>
  );
}
