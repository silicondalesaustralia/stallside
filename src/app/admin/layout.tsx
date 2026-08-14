import type { Metadata } from "next";
import AdminNav from "@/components/AdminNav";
import { requireAdmin } from "@/lib/session";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();
  return (
    <div className="flex min-h-full flex-1 bg-[var(--wash)]">
      <AdminNav />
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="mx-auto w-full max-w-[86rem] flex-1 px-4 py-6 md:px-6 md:py-8">
          {children}
        </div>
      </div>
    </div>
  );
}
