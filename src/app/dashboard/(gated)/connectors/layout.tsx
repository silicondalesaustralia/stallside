import '@/styles/tradiespost.css'
import { ToastProvider } from '@/components/ui/Toast'
import ConnectorsComingSoon from '@/components/connectors/ConnectorsComingSoon'

export const dynamic = 'force-dynamic'

export default function ConnectorsLayout({ children }: { children: React.ReactNode }) {
  if (process.env.SOCIAL_SECTION_LIVE !== '1') return <ConnectorsComingSoon />
  return (
    <ToastProvider>
      <div data-tp-theme className="min-h-full text-tradiespost-text">
        {children}
      </div>
    </ToastProvider>
  )
}
