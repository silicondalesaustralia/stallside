import { requireOwner } from "@/lib/session";
import { resolveSelectedBusiness } from "@/lib/selected-business";
import { loadDataContext, type DataContext } from "./context";

/** Data context for the business picked in the dashboard switcher. */
export async function loadSelectedDataContext(): Promise<DataContext | null> {
  const { owner } = await requireOwner();
  const { selected } = await resolveSelectedBusiness(owner.id);
  if (!selected) return null;
  return loadDataContext(owner, selected.id);
}
