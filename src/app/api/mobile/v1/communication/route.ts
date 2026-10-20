import {
  communicationInput,
  type CampaignSendResponse,
  type CommunicationResponse,
} from "@/contracts/mobile/communication";
import { requireMobileOwner } from "@/lib/mobile/require-owner";
import { listOwnerCampaigns, listOwnerStandingLists } from "@/lib/communication/load";
import { sendOwnerCommunication } from "@/lib/communication/send";
import { toMobileCampaignRow } from "@/lib/mobile/campaign-dto";
import { mobileError, mobileJson, mobileServerError, readMobileBody } from "@/lib/mobile/http";

/** Sent messages and the auto-updating lists. Messages belong to the account, not one business. */
export async function GET(request: Request) {
  const guard = await requireMobileOwner(request);
  if (!guard.ok) return guard.response;
  try {
    const ownerId = guard.value.owner.id;
    const [campaigns, standingLists] = await Promise.all([
      listOwnerCampaigns(ownerId),
      listOwnerStandingLists(ownerId),
    ]);
    return mobileJson<CommunicationResponse>({ campaigns: campaigns.map(toMobileCampaignRow), standingLists });
  } catch (error) {
    return mobileServerError("Mobile communication failed", error);
  }
}

/** Saves the message and starts sending it straight away. */
export async function POST(request: Request) {
  const guard = await requireMobileOwner(request);
  if (!guard.ok) return guard.response;
  const body = await readMobileBody(request, communicationInput);
  if (!body.ok) return body.response;
  try {
    const result = await sendOwnerCommunication(guard.value.owner.id, body.data);
    if ("error" in result) return mobileError(400, result.error);
    return mobileJson<CampaignSendResponse>({ id: result.id }, 201);
  } catch (error) {
    return mobileServerError("Mobile communication send failed", error);
  }
}
