import '@/styles/tradiespost.css'
import { redirect } from 'next/navigation'
import { ToastProvider } from '@/components/ui/Toast'
import SocialSubnav from '@/components/social/SocialSubnav'
import { TradiesPostSocialWorkspaceProvider } from '@/components/tradiespost/TradiesPostSocialWorkspaceProvider'
import { socialKitEnabledFor } from '@/lib/beta-features'
import { requireOwner } from '@/lib/session'

export const dynamic = 'force-dynamic'

/** Social pages inside the Vendl dashboard; beta owners only (see lib/beta-features). */
export default async function SocialLayout({ children }: { children: React.ReactNode }) {
  const { owner } = await requireOwner()
  if (!socialKitEnabledFor(owner)) redirect('/dashboard')
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
