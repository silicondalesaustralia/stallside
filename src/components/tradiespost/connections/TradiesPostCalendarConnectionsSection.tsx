'use client'

import { Calendar, CalendarDays } from 'lucide-react'
import { TradiesPostSectionTitle } from '@/components/tradiespost/ui/TradiesPostTypography'
import { TradiesPostProviderConnectionCard } from '@/components/tradiespost/connections/TradiesPostProviderConnectionCard'

const CALENDAR_PROVIDERS = [
  {
    id: 'google-calendar',
    name: 'Google Calendar',
    benefit: 'Sync collection days and market dates with Google Calendar.',
    icon: <Calendar className="h-6 w-6 text-[#4285F4]" aria-hidden />,
    testId: 'tp-connection-google-calendar',
  },
  {
    id: 'microsoft-outlook',
    name: 'Microsoft Outlook & 365',
    benefit: 'Sync collection days and market dates with Outlook and Microsoft 365.',
    icon: <CalendarDays className="h-6 w-6 text-[#0078D4]" aria-hidden />,
    testId: 'tp-connection-microsoft-outlook',
  },
] as const

export function TradiesPostCalendarConnectionsSection() {
  return (
    <section className="mt-12" data-testid="tp-calendar-connections-section">
      <TradiesPostSectionTitle className="mb-1">Calendar sync</TradiesPostSectionTitle>
      <p className="mb-5 text-sm text-zinc-600">
        Connect your work calendar so scheduled posts align with your week.
      </p>

      <div className="social-connections-grid">
        {CALENDAR_PROVIDERS.map((provider) => (
          <TradiesPostProviderConnectionCard
            key={provider.id}
            name={provider.name}
            benefit={provider.benefit}
            icon={provider.icon}
            status="coming_soon"
            testId={provider.testId}
          />
        ))}
      </div>
    </section>
  )
}
