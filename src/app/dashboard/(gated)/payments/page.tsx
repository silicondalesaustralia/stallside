import { redirect } from "next/navigation";
import { requireOwner } from "@/lib/session";
import { resolveSelectedBusiness } from "@/lib/selected-business";

export default async function PaymentsPage() {
  const { owner } = await requireOwner();
  const { selected } = await resolveSelectedBusiness(owner.id);
  if (!selected) redirect("/dashboard/businesses/new");
  redirect(`/dashboard/businesses/${selected.id}?tab=payments`);
}
