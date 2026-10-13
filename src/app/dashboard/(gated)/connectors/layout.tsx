import '@/styles/tradiespost.css'
import { ToastProvider } from '@/components/ui/Toast'

export const dynamic = 'force-dynamic'

export default function ConnectorsLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <div data-tp-theme className="min-h-full text-tradiespost-text">
        {children}
      </div>
    </ToastProvider>
  )
}
