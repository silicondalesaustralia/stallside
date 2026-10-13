import { Suspense } from 'react'
import { Loader2 } from 'lucide-react'
import UnifiedCalendar from '@/components/unified-calendar/UnifiedCalendar'
import { TradiesPostAppPage } from '@/components/tradiespost/TradiesPostAppPage'
import { TradiesPostPageHeader } from '@/components/tradiespost/ui'
import {
  loadUnifiedCalendar,
  type UnifiedCalendarSearchParams,
} from '@/lib/unified-calendar/loadUnifiedCalendar'

export default async function SocialCalendarPage({
  searchParams,
}: {
  searchParams: Promise<UnifiedCalendarSearchParams>
}) {
  const data = await loadUnifiedCalendar(await searchParams)

  return (
    <TradiesPostAppPage maxWidth="6xl">
      <TradiesPostPageHeader
        title="Calendar"
        subtitle="Your posts, with pickups, markets and cut-offs one tap away."
      />
      <Suspense fallback={<Loader2 className="mx-auto mt-24 h-8 w-8 animate-spin text-[#F5C518]" />}>
        <UnifiedCalendar {...data} initialCategories={['social']} />
      </Suspense>
    </TradiesPostAppPage>
  )
}
