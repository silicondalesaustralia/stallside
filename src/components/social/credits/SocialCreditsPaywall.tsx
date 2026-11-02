import { TradiesPostAppPage } from '@/components/tradiespost/TradiesPostAppPage'
import { TradiesPostPageHeader } from '@/components/tradiespost/ui'
import type { SocialCreditsView } from '@/lib/socialCredits/creditsView'
import SocialCreditsPanel from './SocialCreditsPanel'

type Props = { view: SocialCreditsView; locked: boolean }

/** The credits page; also shown in place of every Social page while the owner has no access. */
export default function SocialCreditsPaywall({ view, locked }: Props) {
  return (
    <TradiesPostAppPage>
      <TradiesPostPageHeader
        eyebrow="Social"
        title={locked ? 'Buy credits to use Social' : 'Credits'}
        subtitle={
          locked
            ? 'Social runs on credits. Pick a pack to unlock posts, AI designs and video clips. Your connected accounts stay connected.'
            : view.isPro
              ? 'Pro includes 5 AI designs and 5 video clips every month. Top up any time - bought credits never expire.'
              : 'Social stays unlocked while you have credits. Top up any time - bought credits never expire.'
        }
      />
      <SocialCreditsPanel view={view} />
    </TradiesPostAppPage>
  )
}
