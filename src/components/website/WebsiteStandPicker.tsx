import { prisma } from "@/lib/prisma";
import { pickWebsiteStand } from "@/lib/storefront/website-stand";
import { setWebsiteStandAction } from "@/app/dashboard/(gated)/website/website-stand-actions";

/** Lets owners with several stands choose which one powers the website. */
export default async function WebsiteStandPicker({
  ownerId,
  draftConfig,
  saved,
}: {
  ownerId: string;
  draftConfig: unknown;
  saved?: boolean;
}) {
  const stands = await prisma.stand.findMany({
    where: { ownerId },
    orderBy: { createdAt: "asc" },
    select: { id: true, name: true, slug: true },
  });
  if (stands.length < 2) return null;
  const current = pickWebsiteStand(stands, draftConfig);

  return (
    <form action={setWebsiteStandAction} className="rounded-2xl border border-[var(--line)] bg-white p-5">
      <label htmlFor="website-stand" className="font-semibold text-[var(--field)]">
        Stand for your website
      </label>
      <p className="mt-1 text-sm text-[var(--muted)]">
        Your website shows this stand&apos;s online products and uses its cart and checkout. Old links and QR
        codes for this stand move to the website; your other stands keep their own pages.
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <select
          id="website-stand"
          name="standId"
          defaultValue={current?.id}
          className="rounded-xl border border-[var(--line)] px-3 py-2 text-sm"
        >
          {stands.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
        <button type="submit" className="rounded-full bg-[var(--field)] px-4 py-2 text-sm font-semibold text-white">
          Use this stand
        </button>
        {saved ? <span className="text-sm font-medium text-[var(--ok)]">Saved — live now.</span> : null}
      </div>
    </form>
  );
}
