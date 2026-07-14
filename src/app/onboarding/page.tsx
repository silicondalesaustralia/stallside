import BrandLockup from "@/components/BrandLockup";
import { completeOnboarding } from "./actions";
import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function OnboardingPage() {
  const user = await requireUser();
  const existing = await prisma.owner.findUnique({ where: { userId: user.id } });
  if (existing) redirect("/dashboard");

  return (
    <main className="mx-auto flex min-h-full w-full max-w-md flex-1 flex-col justify-center px-6 py-16">
      <BrandLockup />
      <h1 className="mt-8 font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight text-[var(--field)]">
        Set up your business
      </h1>
      <p className="mt-2 text-[var(--muted)]">One quick step before your dashboard.</p>
      <form action={completeOnboarding} className="mt-8 flex flex-col gap-4">
        <label className="flex flex-col gap-2 text-sm">
          <span className="font-medium">Business / farm name</span>
          <input
            name="businessName"
            required
            defaultValue={user.name ?? ""}
            className="rounded-[var(--radius)] border border-[var(--line)] bg-white px-3 py-2.5"
          />
        </label>
        <label className="flex flex-col gap-2 text-sm">
          <span className="font-medium">Contact email</span>
          <input
            name="contactEmail"
            type="email"
            required
            defaultValue={user.email ?? ""}
            className="rounded-[var(--radius)] border border-[var(--line)] bg-white px-3 py-2.5"
          />
        </label>
        <label className="flex flex-col gap-2 text-sm">
          <span className="font-medium">Phone (optional)</span>
          <input
            name="contactPhone"
            className="rounded-[var(--radius)] border border-[var(--line)] bg-white px-3 py-2.5"
          />
        </label>
        <button
          type="submit"
          className="rounded-[var(--radius-pill)] bg-[var(--leaf)] px-4 py-3 text-sm font-semibold text-white hover:bg-[var(--leaf-dark)]"
        >
          Continue
        </button>
      </form>
    </main>
  );
}
