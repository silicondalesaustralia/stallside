import { requireAdmin } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { inviteHasSeats, lifetimeInviteUrl } from "@/lib/lifetime-invite";
import { createLifetimeInviteAction } from "./actions";
import InviteCopyLink from "@/components/InviteCopyLink";

export default async function AdminInvitesPage({
  searchParams,
}: {
  searchParams: Promise<{ created?: string }>;
}) {
  await requireAdmin();
  const { created } = await searchParams;
  const invites = await prisma.lifetimeInvite.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      redemptions: {
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { email: true },
      },
    },
  });

  const createdUrl = created ? lifetimeInviteUrl(created) : null;

  return (
    <main className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">
          Free for Life invites
        </h1>
        <p className="mt-1 text-[var(--muted)]">
          Set seats to 1 for a private DM, or 20 for a Facebook group post — one
          link, capped redemptions, Card / Tap &amp; Go forever.
        </p>
      </div>

      <form
        action={createLifetimeInviteAction}
        className="flex flex-col gap-3 rounded-[var(--radius)] border border-[var(--line)] bg-white p-4 sm:flex-row sm:items-end"
      >
        <label className="flex w-full flex-col gap-1.5 text-sm sm:w-28">
          <span className="font-medium">Seats</span>
          <input
            type="number"
            name="maxUses"
            min={1}
            max={500}
            defaultValue={1}
            required
            className="rounded-[var(--radius)] border border-[var(--line)] px-3 py-2 outline-none ring-[var(--leaf)] focus:ring-2"
          />
        </label>
        <label className="flex min-w-0 flex-1 flex-col gap-1.5 text-sm">
          <span className="font-medium">Note (optional)</span>
          <input
            type="text"
            name="note"
            placeholder="FB farmers group — Jul 2026"
            className="rounded-[var(--radius)] border border-[var(--line)] px-3 py-2 outline-none ring-[var(--leaf)] focus:ring-2"
          />
        </label>
        <button
          type="submit"
          className="rounded-[var(--radius-pill)] bg-[var(--leaf)] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[var(--leaf-dark)]"
        >
          Create invite link
        </button>
      </form>

      {createdUrl ? (
        <div className="rounded-[var(--radius)] border border-[var(--leaf)] bg-[var(--panel)] p-4">
          <p className="text-sm font-semibold text-[var(--field)]">
            New invite ready — copy and post it
          </p>
          <InviteCopyLink url={createdUrl} />
        </div>
      ) : null}

      {invites.length === 0 ? (
        <p className="text-sm text-[var(--muted)]">No invites yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--line)] text-xs uppercase tracking-wide text-[var(--muted)]">
                <th className="py-2 pr-3 font-medium">Seats</th>
                <th className="py-2 pr-3 font-medium">Status</th>
                <th className="py-2 pr-3 font-medium">Link</th>
                <th className="py-2 pr-3 font-medium">Note</th>
                <th className="py-2 font-medium">Created</th>
              </tr>
            </thead>
            <tbody>
              {invites.map((invite) => {
                const url = lifetimeInviteUrl(invite.token);
                const open = inviteHasSeats(invite);
                return (
                  <tr key={invite.id} className="border-b border-[var(--line)]">
                    <td className="py-3 pr-3 font-medium">
                      {invite.useCount}/{invite.maxUses}
                    </td>
                    <td className="py-3 pr-3">
                      {open ? (
                        <span className="font-medium text-[var(--leaf)]">Open</span>
                      ) : (
                        <span className="text-[var(--muted)]">Full</span>
                      )}
                      {invite.redemptions[0] ? (
                        <p className="mt-0.5 text-xs text-[var(--muted)]">
                          Latest: {invite.redemptions[0].email}
                          {invite.redemptions.length > 1
                            ? ` +${invite.useCount - 1}`
                            : ""}
                        </p>
                      ) : null}
                    </td>
                    <td className="py-3 pr-3">
                      {open ? (
                        <InviteCopyLink url={url} compact />
                      ) : (
                        <span className="font-mono text-xs text-[var(--muted)]">
                          …{invite.token.slice(-8)}
                        </span>
                      )}
                    </td>
                    <td className="py-3 pr-3 text-[var(--muted)]">
                      {invite.note || "—"}
                    </td>
                    <td className="py-3 text-[var(--muted)]">
                      {invite.createdAt.toLocaleDateString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
