import type { ReferralsResponse } from "@/contracts/mobile/referrals";
import { formatTotals, totalsAreEmpty } from "@/lib/affiliate/currency-totals";
import { loadOwnerReferrals } from "@/lib/affiliate/load-owner-referrals";

/** Referral link, stats and referred businesses, as on the web Referrals page. */
export async function loadReferralsResponse(ownerId: string): Promise<ReferralsResponse> {
  const { eligible, hadLink, url, stats } = await loadOwnerReferrals(ownerId);
  return {
    eligible,
    hadLink,
    url,
    stats: stats
      ? {
          clicks: stats.clicks,
          signups: stats.signups,
          livePro: stats.livePro,
          monthlyCommission: formatTotals(stats.monthlyCommission),
          owed: formatTotals(stats.owed),
          paid: formatTotals(stats.paid),
          missed: totalsAreEmpty(stats.missed) ? null : formatTotals(stats.missed),
        }
      : null,
    referrals: (stats?.referrals ?? []).map((r) => ({
      id: r.id,
      businessName: r.businessName,
      joinedOn: r.joinedAt.toISOString().slice(0, 10),
      status: r.status,
      earnedLabel: formatTotals(r.earned),
    })),
  };
}
