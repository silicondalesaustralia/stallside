'use client'

import { CalendarDays } from 'lucide-react'
import { TradiesPostSectionTitle } from '@/components/tradiespost/ui/TradiesPostTypography'
import { TradiesPostProviderConnectionCard } from '@/components/tradiespost/connections/TradiesPostProviderConnectionCard'
import GoogleCalendarConnectionCard from '@/components/tradiespost/connections/GoogleCalendarConnectionCard'

export function TradiesPostCalendarConnectionsSection({
  canManageConnections,
}: {
  canManageConnections: boolean
}) {
  return (
    <section className="mt-12" data-testid="tp-calendar-connections-section">
      <TradiesPostSectionTitle className="mb-1">Calendar sync</TradiesPostSectionTitle>
      <p className="mb-5 text-sm text-zinc-600">
        Your Vendl calendar and your own calendar, kept in step both ways.
      </p>

      <div className="social-connections-grid">
        <GoogleCalendarConnectionCard canManageConnections={canManageConnections} />
        <TradiesPostProviderConnectionCard
          name="Microsoft Outlook & 365"
          benefit="Sync collection days and market dates with Outlook and Microsoft 365."
          icon={<CalendarDays className="h-6 w-6 text-[#0078D4]" aria-hidden />}
          status="coming_soon"
          testId="tp-connection-microsoft-outlook"
        />
      </div>
    </section>
  )
}
