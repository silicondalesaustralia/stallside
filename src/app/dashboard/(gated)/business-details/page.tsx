import { redirect } from "next/navigation";
import { requireOwner } from "@/lib/session";
import { resolveSelectedBusiness } from "@/lib/selected-business";

/** Sidebar "Business Details": open the currently selected business. */
export default async function BusinessDetailsPage() {
  const { owner } = await requireOwner();
  const { selected } = await resolveSelectedBusiness(owner.id);
  redirect(selected ? `/dashboard/businesses/${selected.id}` : "/dashboard/businesses/new");
}
