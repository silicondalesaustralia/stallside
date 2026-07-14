import DashboardNav from "@/components/DashboardNav";
import OwnerPushRegister from "@/components/OwnerPushRegister";
import { requireOwner } from "@/lib/session";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireOwner();
  return (
    <div className="flex min-h-full flex-1 flex-col bg-[var(--wash)] pb-20 md:pb-0">
      <OwnerPushRegister />
      <DashboardNav />
      <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">{children}</div>
    </div>
  );
}
