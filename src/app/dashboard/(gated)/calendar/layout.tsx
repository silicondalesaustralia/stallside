import '@/styles/tradiespost.css'
import { ToastProvider } from '@/components/ui/Toast'
import ProFeatureGate from '@/components/dashboard/ProFeatureGate'

export default function CalendarLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProFeatureGate feature="calendar">
      <ToastProvider>
        <div data-tp-theme className="min-h-full text-tradiespost-text">
          {children}
        </div>
      </ToastProvider>
    </ProFeatureGate>
  )
}
