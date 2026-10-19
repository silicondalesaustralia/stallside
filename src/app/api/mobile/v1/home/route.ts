import { homeQuery, type HomeResponse } from "@/contracts/mobile/home";
import { requireMobileOwner, requireMobileStand } from "@/lib/mobile/require-owner";
import { loadDashboardHomeData } from "@/lib/dashboard/home";
import { resolveDateWindow } from "@/lib/date-range";
import { resolveStandTimezone } from "@/lib/stand-timezone";
import { toHomeResponse } from "@/lib/mobile/home-dto";
import { mobileJson, mobileServerError, readMobileQuery } from "@/lib/mobile/http";

/** Same numbers as the web dashboard home (shared loader), for the app's Home tab. */
export async function GET(request: Request) {
  const guard = await requireMobileOwner(request);
  if (!guard.ok) return guard.response;

  const query = readMobileQuery(request, homeQuery);
  if (!query.ok) return query.response;

  const { owner } = guard.value;
  const stand = await requireMobileStand(owner.id, query.data.standId);
  if (!stand.ok) return stand.response;

  try {
    const timeZone = resolveStandTimezone(stand.value.timezone);
    const window = resolveDateWindow({ range: query.data.range }, timeZone);
    const monthStart = new Date();
    monthStart.setUTCDate(1);
    monthStart.setUTCHours(0, 0, 0, 0);

    const data = await loadDashboardHomeData({
      ownerId: owner.id,
      standId: stand.value.id,
      window,
      timeZone,
      monthStart,
      loadUpgradeSignals: false,
    });

    return mobileJson<HomeResponse>(
      toHomeResponse(data, { key: query.data.range, label: window.label }),
    );
  } catch (error) {
    return mobileServerError("Mobile home failed", error);
  }
}
