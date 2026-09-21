import Link from "next/link";
import { prisma } from "@/lib/prisma";

/** Shown on the owner dashboard when this login also supplies another stand. */
export default async function SupplyForOthersLink({ userId }: { userId: string }) {
  const membership = await prisma.standMember.findFirst({
    where: { userId, status: "ACTIVE" },
    select: { id: true },
  });
  if (!membership) return null;
  return (
    <p className="mb-4 text-sm">
      <Link href="/supply" className="text-[var(--leaf-dark)] underline">
        Open supplier access
      </Link>
    </p>
  );
}
