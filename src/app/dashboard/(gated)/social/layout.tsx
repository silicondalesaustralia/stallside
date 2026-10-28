import '@/styles/tradiespost.css'
import { ToastProvider } from '@/components/ui/Toast'
import SocialComingSoon from '@/components/social/SocialComingSoon'
import SocialSubnav from '@/components/social/SocialSubnav'
import { TradiesPostSocialWorkspaceProvider } from '@/components/tradiespost/TradiesPostSocialWorkspaceProvider'
import { socialKitEnabledFor } from '@/lib/beta-features'
import { requireOwner } from '@/lib/session'

export const dynamic = 'force-dynamic'

/**
 * Social pages inside the Vendl dashboard (see lib/beta-features). Without the
 * Social kit the section opens with its tabs greyed out and a coming-soon page.
 */
export default async function SocialLayout({ children }: { children: React.ReactNode }) {
  const { owner, user } = await requireOwner()
  if (!socialKitEnabledFor(owner, user.email)) {
    return (
      <>
        <SocialSubnav disabled />
        <SocialComingSoon />
      </>
    )
  }
  return (
    <ToastProvider>
      <TradiesPostSocialWorkspaceProvider>
        <SocialSubnav />
        <div data-tp-theme className="min-h-full text-tradiespost-text">
          {children}
        </div>
      </TradiesPostSocialWorkspaceProvider>
    </ToastProvider>
  )
}
