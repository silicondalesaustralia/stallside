import '@/styles/tradiespost.css'
import { ToastProvider } from '@/components/ui/Toast'
import SocialSubnav from '@/components/social/SocialSubnav'
import SocialComingSoon from '@/components/social/SocialComingSoon'
import { TradiesPostSocialWorkspaceProvider } from '@/components/tradiespost/TradiesPostSocialWorkspaceProvider'

export const dynamic = 'force-dynamic'

/** Social pages inside the Vendl dashboard (sidebar + owner gate come from dashboard/layout). */
export default function SocialLayout({ children }: { children: React.ReactNode }) {
  if (process.env.SOCIAL_SECTION_LIVE !== '1') {
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
