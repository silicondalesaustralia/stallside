import { getLifetimeInvite, inviteHasSeats } from "@/lib/lifetime-invite";

/** Public promo Free for Life invite (homepage ticker). */
export const PROMO_LIFETIME_INVITE_TOKEN = "TG-2Mxqy7YswLy9I90dSHuux";

export function promoLifetimeInvitePath() {
  return `/invite/${PROMO_LIFETIME_INVITE_TOKEN}`;
}

/** Remaining seats for the promo invite, or 0 if missing/full. */
export async function getPromoLifetimeSeatsLeft(): Promise<number> {
  const invite = await getLifetimeInvite(PROMO_LIFETIME_INVITE_TOKEN);
  if (!invite || !inviteHasSeats(invite)) return 0;
  return Math.max(0, invite.maxUses - invite.useCount);
}
