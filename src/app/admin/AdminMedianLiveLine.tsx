import { medianSignupToFirstLiveMs } from "@/lib/signup-timing";

export default async function AdminMedianLiveLine() {
  const medianLiveMs = await medianSignupToFirstLiveMs();
  const medianLiveLabel =
    medianLiveMs == null
      ? "n/a"
      : medianLiveMs < 60_000
        ? `${Math.round(medianLiveMs / 1000)}s`
        : `${(medianLiveMs / 60_000).toFixed(1)}m`;
  return (
    <p className="mt-1 text-sm text-[var(--muted)]">
      Median signup → first live product: <strong>{medianLiveLabel}</strong>
      {medianLiveMs != null && medianLiveMs > 60_000
        ? " (over 60s — fix setup before new verticals)"
        : ""}
    </p>
  );
}
