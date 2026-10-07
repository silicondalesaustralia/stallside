import AdminRecentOwners from "@/components/AdminRecentOwners";
import { prisma } from "@/lib/prisma";

export default async function AdminRecentOwnersSection() {
  const recent = await prisma.owner.findMany({
    orderBy: { createdAt: "desc" },
    take: 8,
    include: {
      user: true,
      stands: { select: { name: true }, take: 3 },
    },
  });
  return (
    <section className="dash-card p-5">
      <h2 className="text-lg font-semibold">Recent owners</h2>
      <AdminRecentOwners owners={recent} />
    </section>
  );
}
