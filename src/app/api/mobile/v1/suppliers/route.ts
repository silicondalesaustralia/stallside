import type { MobileOk } from "@/contracts/mobile/common";
import { inviteSupplierBody, suppliersQuery, type SuppliersResponse } from "@/contracts/mobile/suppliers";
import { requireMobileOwner, requireMobileStand } from "@/lib/mobile/require-owner";
import { inviteOwnerSupplier, listOwnerSuppliers } from "@/lib/suppliers/members";
import { toMobileSupplierRow } from "@/lib/mobile/supplier-dto";
import { mobileError, mobileJson, mobileServerError, readMobileBody, readMobileQuery } from "@/lib/mobile/http";

export async function GET(request: Request) {
  const guard = await requireMobileOwner(request);
  if (!guard.ok) return guard.response;
  const query = readMobileQuery(request, suppliersQuery);
  if (!query.ok) return query.response;

  const ownerId = guard.value.owner.id;
  const stand = await requireMobileStand(ownerId, query.data.standId);
  if (!stand.ok) return stand.response;

  try {
    const suppliers = await listOwnerSuppliers(ownerId, stand.value.id);
    return mobileJson<SuppliersResponse>({ suppliers: suppliers.map(toMobileSupplierRow) });
  } catch (error) {
    return mobileServerError("Mobile suppliers failed", error);
  }
}

/** Emails an invite so the supplier can add their products and stock. */
export async function POST(request: Request) {
  const guard = await requireMobileOwner(request);
  if (!guard.ok) return guard.response;
  const body = await readMobileBody(request, inviteSupplierBody);
  if (!body.ok) return body.response;

  const { owner } = guard.value;
  const stand = await requireMobileStand(owner.id, body.data.standId);
  if (!stand.ok) return stand.response;

  try {
    const result = await inviteOwnerSupplier(owner, stand.value, body.data.name, body.data.email);
    if ("error" in result) return mobileError(400, result.error);
    return mobileJson<MobileOk>({ ok: true }, 201);
  } catch (error) {
    return mobileServerError("Mobile supplier invite failed", error);
  }
}
