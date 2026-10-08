'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTradiesPostSocialWorkspace } from '@/components/tradiespost/TradiesPostSocialWorkspaceProvider'
import {
  SocialTabLoading,
  SocialTabPanel,
  type SocialShellTab,
} from '@/components/social/SocialTabPanel'
import { SocialProductVariantProvider } from '@/components/tradiespost/SocialProductVariant'
import { TradiesPostAppPage } from '@/components/tradiespost/TradiesPostAppPage'
import { TradiesPostPageHeader } from '@/components/tradiespost/ui'

type SocialRoutePageProps = {
  tab: SocialShellTab
  title: string
  subtitle?: string
  wide?: boolean
}

export function SocialRoutePage({ tab, title, subtitle, wide }: SocialRoutePageProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const ctx = useTradiesPostSocialWorkspace()

  const initialJobId = searchParams.get('jobId')
  const agentSuggestionId = searchParams.get('agentSuggestionId')
  const initialComposeStep = searchParams.get('step')
  const buildWeek = searchParams.get('buildWeek') === '1'
  const plannerWeekStart = searchParams.get('weekStart')
  const calendarWeekStart = searchParams.get('calendarWeekStart')
  const calendarPostId = searchParams.get('calendarPostId')
  const weekPlanId = searchParams.get('weekPlanId')

  function openWeekPlan(id: string) {
    const url = new URL(window.location.href)
    url.pathname = '/dashboard/social/planner'
    url.searchParams.set('weekPlanId', id)
    url.searchParams.delete('buildWeek')
    router.push(`${url.pathname}?${url.searchParams.toString()}`)
  }

  function closeWeekPlan() {
    const url = new URL(window.location.href)
    url.searchParams.delete('weekPlanId')
    router.replace(`${url.pathname}?${url.searchParams.toString()}`)
  }

  function clearCalendarPostDeepLink() {
    const url = new URL(window.location.href)
    if (!url.searchParams.has('calendarPostId')) return
    url.searchParams.delete('calendarPostId')
    router.replace(`${url.pathname}?${url.searchParams.toString()}`)
  }

  useEffect(() => {
    if (tab === 'calendar') {
      void ctx.loadData({ force: true })
    }
  }, [tab, ctx.loadData])

  const refreshWorkspace = () => void ctx.loadData({ force: true })

  if (ctx.loading && !ctx.business) {
    return <SocialTabLoading variant="tradiespost" />
  }

  return (
    <TradiesPostAppPage maxWidth={wide ? '6xl' : '2xl'}>
      <TradiesPostPageHeader title={title} subtitle={subtitle} />
      <div data-tp-social>
        <SocialProductVariantProvider variant="tradiespost">
          <SocialTabPanel
            variant="tradiespost"
            tab={tab}
            business={ctx.business}
            posts={ctx.posts}
            loadError={ctx.loadError}
            loadData={refreshWorkspace}
            setBusiness={ctx.setBusiness}
            infographicAiBackgroundEnabled={ctx.infographicAiBackgroundEnabled}
            aiDesignedEnabled={ctx.aiDesignedEnabled}
            connectionsHref="/dashboard/social/connections"
            weekPlanId={weekPlanId}
            buildWeek={buildWeek}
            plannerWeekStart={plannerWeekStart}
            calendarWeekStart={calendarWeekStart}
            calendarPostId={calendarPostId}
            initialJobId={initialJobId}
            agentSuggestionId={agentSuggestionId}
            initialComposeStep={initialComposeStep}
            onOpenWeekPlan={openWeekPlan}
            onCloseWeekPlan={closeWeekPlan}
            onClearCalendarPostDeepLink={clearCalendarPostDeepLink}
            onViewLibrary={() => router.push('/dashboard/social/library')}
          />
        </SocialProductVariantProvider>
      </div>
    </TradiesPostAppPage>
  )
}
