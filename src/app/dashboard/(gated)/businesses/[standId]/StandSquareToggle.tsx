import Link from "next/link";
import PaymentBrandIcon from "@/components/PaymentBrandIcon";

export default function StandSquareToggle({
  acceptSquare,
  squareReady,
  squareIsProvider,
}: {
  acceptSquare: boolean;
  squareReady: boolean;
  squareIsProvider: boolean;
}) {
  return (
    <>
      <label className="flex items-start gap-3 text-sm">
        <input
          type="checkbox"
          name="acceptSquare"
          defaultChecked={acceptSquare}
          disabled={!squareReady}
          className="mt-1 size-4 disabled:opacity-50"
        />
        <span className="min-w-0">
          <span className="flex flex-wrap items-center gap-2 font-medium">
            <PaymentBrandIcon brand="square" className="size-5" />
            Square
          </span>
          <span className="mt-0.5 block text-[var(--muted)]">
            {!squareReady
              ? "Connect Square, turn on Square payments and pick a location before enabling."
              : squareIsProvider
                ? "Square card checkout for QR and website. Money to your Square account."
                : "Shown at checkout once Square is your product checkout provider (above)."}
          </span>
        </span>
      </label>
      <p className="text-sm">
        <Link
          href="/dashboard/settings/square"
          className="font-medium text-[var(--leaf-dark)] underline"
        >
          Manage Square
        </Link>
      </p>
    </>
  );
}
