import '@/styles/tradiespost.css'
import { ToastProvider } from '@/components/ui/Toast'
import SocialComingSoon from '@/components/social/SocialComingSoon'
import SocialSubnav from '@/components/social/SocialSubnav'
import { TradiesPostSocialWorkspaceProvider } from '@/components/tradiespost/TradiesPostSocialWorkspaceProvider'
import SocialCreditsPaywall from '@/components/social/credits/SocialCreditsPaywall'
import SocialCreditStatus from '@/components/social/credits/SocialCreditStatus'
import { socialKitEnabledFor } from '@/lib/beta-features'
import { loadOwnerSocialAccess, withSavedCard } from '@/lib/socialCredits/creditsView'
import { requireOwner } from '@/lib/session'

export const dynamic = 'force-dynamic'

/**
 * Social pages inside the Vendl dashboard (see lib/beta-features). Without the
 * Social kit the section opens with its tabs greyed out and a coming-soon page.
 */
export default async function SocialLayout({ children }: { children: React.ReactNode }) {
  const { owner, user, impersonator } = await requireOwner()
  if (!socialKitEnabledFor(owner, user.email, impersonator?.email)) {
    return (
      <>
        <SocialSubnav disabled />
        <SocialComingSoon />
      </>
    )
  }
  const access = await loadOwnerSocialAccess(owner.id)
  const paywall = access.canUseSocial ? null : await withSavedCard(access)
  return (
    <ToastProvider>
      <TradiesPostSocialWorkspaceProvider>
        <SocialSubnav aside={<SocialCreditStatus summary={access.summary} />} />
        <div data-tp-theme className="min-h-full text-tradiespost-text">
          {paywall ? <SocialCreditsPaywall view={paywall} locked /> : children}
        </div>
      </TradiesPostSocialWorkspaceProvider>
    </ToastProvider>
  )
}
