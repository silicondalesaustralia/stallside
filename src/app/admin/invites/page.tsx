import Link from "next/link";
import { requireAdmin } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { lifetimeInviteUrl } from "@/lib/lifetime-invite";
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
  });

  const createdUrl = created ? lifetimeInviteUrl(created) : null;

  return (
    <main className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">
          Free for Life invites
        </h1>
        <p className="mt-1 text-[var(--muted)]">
          Each link is one-use. Create a new one whenever you want to hand out
          another Card / Tap &amp; Go forever seat.
        </p>
      </div>

      <form
        action={createLifetimeInviteAction}
        className="flex flex-col gap-3 rounded-[var(--radius)] border border-[var(--line)] bg-white p-4 sm:flex-row sm:items-end"
      >
        <label className="flex min-w-0 flex-1 flex-col gap-1.5 text-sm">
          <span className="font-medium">Note (optional)</span>
          <input
            type="text"
            name="note"
            placeholder="Pilot farm — Jane"
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
            New invite ready — copy and send it
          </p>
          <InviteCopyLink url={createdUrl} />
        </div>
      ) : null}

      {invites.length === 0 ? (
        <p className="text-sm text-[var(--muted)]">No invites yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--line)] text-xs uppercase tracking-wide text-[var(--muted)]">
                <th className="py-2 pr-3 font-medium">Status</th>
                <th className="py-2 pr-3 font-medium">Link</th>
                <th className="py-2 pr-3 font-medium">Note</th>
                <th className="py-2 font-medium">Created</th>
              </tr>
            </thead>
            <tbody>
              {invites.map((invite) => {
                const url = lifetimeInviteUrl(invite.token);
                const used = Boolean(invite.usedAt);
                return (
                  <tr key={invite.id} className="border-b border-[var(--line)]">
                    <td className="py-3 pr-3">
                      {used ? (
                        <span className="text-[var(--muted)]">
                          Used
                          {invite.usedByEmail ? (
                            <>
                              {" "}
                              ·{" "}
                              <Link
                                href={`/admin/owners`}
                                className="underline"
                              >
                                {invite.usedByEmail}
                              </Link>
                            </>
                          ) : null}
                        </span>
                      ) : invite.claimedEmail ? (
                        <span className="text-[var(--marigold)]">
                          Claimed · {invite.claimedEmail}
                        </span>
                      ) : (
                        <span className="font-medium text-[var(--leaf)]">Open</span>
                      )}
                    </td>
                    <td className="py-3 pr-3">
                      {used ? (
                        <span className="font-mono text-xs text-[var(--muted)]">
                          …{invite.token.slice(-8)}
                        </span>
                      ) : (
                        <InviteCopyLink url={url} compact />
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
