import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/session";

export default async function SupplyInvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const member = await prisma.standMember.findUnique({
    where: { inviteToken: token },
    include: { stand: { select: { name: true } } },
  });
  if (!member || member.status === "REVOKED") {
    return (
      <main className="mx-auto max-w-md px-6 py-16">
        <h1 className="text-2xl font-bold text-[var(--field)]">Invite unavailable</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          This supplier invite is no longer valid.
        </p>
      </main>
    );
  }

  const session = await getAuthSession();
  if (!session?.user?.id || !session.user.email) {
    const callback = `/supply/invite/${token}`;
    return (
      <main className="mx-auto max-w-md px-6 py-16">
        <h1 className="text-2xl font-bold text-[var(--field)]">
          Join {member.stand.name}
        </h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Sign in as {member.email} to add your products and update stock.
        </p>
        <Link
          href={`/login?callbackUrl=${encodeURIComponent(callback)}`}
          className="mt-6 inline-block text-[var(--leaf-dark)] underline"
        >
          Sign in
        </Link>
      </main>
    );
  }

  if (session.user.email.trim().toLowerCase() !== member.email) {
    return (
      <main className="mx-auto max-w-md px-6 py-16">
        <h1 className="text-2xl font-bold text-[var(--field)]">Wrong account</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          This invite is for {member.email}. You are signed in as {session.user.email}.
        </p>
      </main>
    );
  }

  if (member.status === "INVITED") {
    await prisma.standMember.update({
      where: { id: member.id },
      data: { userId: session.user.id, status: "ACTIVE" },
    });
  }

  redirect("/supply");
}
