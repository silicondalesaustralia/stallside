import '@/styles/tradiespost.css'
import { ToastProvider } from '@/components/ui/Toast'

export default function CalendarLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <div data-tp-theme className="min-h-full text-tradiespost-text">
        {children}
      </div>
    </ToastProvider>
  )
}
