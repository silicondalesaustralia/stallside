import { customersQuery, type CustomersResponse } from "@/contracts/mobile/customers";
import { requireMobileOwner } from "@/lib/mobile/require-owner";
import { listOwnerCustomers } from "@/lib/customers/service";
import { toCustomerSummary } from "@/lib/mobile/customer-dto";
import { mobileJson, mobileServerError, readMobileQuery } from "@/lib/mobile/http";

export async function GET(request: Request) {
  const guard = await requireMobileOwner(request);
  if (!guard.ok) return guard.response;

  const query = readMobileQuery(request, customersQuery);
  if (!query.ok) return query.response;

  try {
    const rows = await listOwnerCustomers(guard.value.owner.id, query.data.q);
    return mobileJson<CustomersResponse>({ customers: rows.map(toCustomerSummary) });
  } catch (error) {
    return mobileServerError("Mobile customers failed", error);
  }
}
