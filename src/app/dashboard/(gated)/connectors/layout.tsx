import '@/styles/tradiespost.css'
import { ToastProvider } from '@/components/ui/Toast'
import ConnectorsComingSoon from '@/components/connectors/ConnectorsComingSoon'
import { socialAdminPreview } from '@/lib/beta-features'
import { requireOwner } from '@/lib/session'

export const dynamic = 'force-dynamic'

export default async function ConnectorsLayout({ children }: { children: React.ReactNode }) {
  const { user } = await requireOwner()
  if (process.env.SOCIAL_SECTION_LIVE !== '1' && !socialAdminPreview(user.email)) {
    return <ConnectorsComingSoon />
  }
  return (
    <ToastProvider>
      <div data-tp-theme className="min-h-full text-tradiespost-text">
        {children}
      </div>
    </ToastProvider>
  )
}
