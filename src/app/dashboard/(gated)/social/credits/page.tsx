import SocialCreditsPaywall from '@/components/social/credits/SocialCreditsPaywall'
import { loadSocialCreditsView } from '@/lib/socialCredits/creditsView'
import { requireOwner } from '@/lib/session'

export default async function SocialCreditsPage() {
  const { owner } = await requireOwner()
  const view = await loadSocialCreditsView(owner.id)
  return <SocialCreditsPaywall view={view} locked={false} />
}
