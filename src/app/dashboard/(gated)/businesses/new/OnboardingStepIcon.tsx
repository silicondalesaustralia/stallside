export type OnboardingStepIconName = "account" | "products" | "website" | "sell";

const PATHS: Record<OnboardingStepIconName, React.ReactNode> = {
  account: (
    <>
      <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z" />
      <path d="M12 12v6M9 15h6" />
    </>
  ),
  products: (
    <>
      <path d="M4 8h16v12H4zM4 8l2-4h12l2 4" />
      <path d="M9 12h6" />
    </>
  ),
  website: (
    <>
      <rect x="3" y="4" width="18" height="14" rx="1.5" />
      <path d="M3 8h18M8 21h8M12 18v3" />
    </>
  ),
  sell: (
    <>
      <path d="M3 6h2l2.5 10h11L21 9H7" />
      <circle cx="10" cy="20" r="1" />
      <circle cx="17" cy="20" r="1" />
    </>
  ),
};

export default function OnboardingStepIcon({
  name,
}: {
  name: OnboardingStepIconName;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-6 shrink-0"
      aria-hidden
    >
      {PATHS[name]}
    </svg>
  );
}
