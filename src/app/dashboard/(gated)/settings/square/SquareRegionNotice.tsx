import { squareRegionLabel, type SquareRegion } from "@/lib/square/region";

export default function SquareRegionNotice({
  region,
  error,
  mismatch,
}: {
  region: SquareRegion;
  error?: string;
  mismatch: boolean;
}) {
  const country = squareRegionLabel(region);
  const message =
    error === "region_mismatch"
      ? `That Square account isn't based in ${country}. Connect a Square account from ${country}, or change your billing region first.`
      : error === "region"
        ? "Your billing region changed while connecting. Try connecting Square again."
        : mismatch
          ? `Your Square connection was made for a different country. Reconnect with a Square account from ${country} to take Square payments.`
          : null;
  if (!message) return null;

  return (
    <p className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
      {message}
    </p>
  );
}
