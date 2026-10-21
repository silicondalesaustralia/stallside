import { redirect } from "next/navigation";
import { CURRENCIES } from "@/lib/constants";
import { DEFAULT_TIMEZONE, STAND_TIMEZONES } from "@/lib/stand-timezone";
import { requireOwner } from "@/lib/session";
import { businessLimitReached } from "@/lib/business-limit";
import { createStand } from "../actions";
import FormField from "@/components/FormField";
import CreateStandSubmitButton from "./CreateStandSubmitButton";
import OnboardingFlow from "@/components/onboarding/OnboardingFlow";

export default async function NewStandPage() {
  const { owner, user } = await requireOwner();
  const existing = await businessLimitReached(owner.id, user.email);
  if (existing) redirect(`/dashboard/businesses/${existing.id}`);

  return (
    <main className="flex flex-col gap-6">
      <h1 className="text-3xl font-semibold tracking-tight">New Business</h1>
      <OnboardingFlow />
      <form action={createStand} className="mt-8 flex flex-col gap-4">
        <input type="hidden" name="intent" value="create" />
        <FormField
          label="Business name"
          name="name"
          required
          placeholder="Green Valley Eggs"
        />
        <FormField
          label="Suburb / location"
          name="locationLabel"
          placeholder="Woodend"
        />
        <label className="flex flex-col gap-2 text-sm">
          <span className="font-medium">Currency</span>
          <select
            name="currency"
            defaultValue="AUD"
            className="rounded-lg border border-[var(--line)] bg-white px-3 py-2.5"
          >
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-2 text-sm">
          <span className="font-medium">Timezone</span>
          <select
            name="timezone"
            defaultValue={DEFAULT_TIMEZONE}
            className="rounded-lg border border-[var(--line)] bg-white px-3 py-2.5"
          >
            {STAND_TIMEZONES.map((z) => (
              <option key={z.value} value={z.value}>
                {z.label}
              </option>
            ))}
          </select>
          <span className="text-[var(--muted)]">
            Used for pre-order order-by and collection times.
          </span>
        </label>
        <CreateStandSubmitButton />
      </form>
    </main>
  );
}
