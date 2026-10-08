'use client'

import { ArrowRight, Check } from 'lucide-react'
import { TP_CREATE_IT_COLUMNS } from '@/lib/tradiespost/assets'
import { TradiesPostSelectableCard } from '@/components/tradiespost/ui/TradiesPostSelectableCard'

export type TradiesPostCreateRoute = 'photos' | 'idea' | 'inspiration'

const ROUTE_ARIA_LABELS: Record<TradiesPostCreateRoute, string> = {
  photos: 'Create content from your photos and videos',
  idea: 'Create content from your idea',
  inspiration: 'Create content from something you like',
}

/** Crop baked-in captions off marketing composite art - illustration only. */
const ROUTE_ILLUSTRATION_CLIP = 'inset(0 0 38% 0)'

const ROUTE_ACTION_LABELS: Record<TradiesPostCreateRoute, string> = {
  photos: 'Use your photos & videos',
  idea: 'Start from your idea',
  inspiration: 'Use a post you like',
}

const ROUTE_SELECTED_LABELS: Record<TradiesPostCreateRoute, string> = {
  photos: 'Using photos & videos',
  idea: 'Using your idea',
  inspiration: 'Using inspiration',
}

const ROUTE_CARDS: { route: TradiesPostCreateRoute; card: (typeof TP_CREATE_IT_COLUMNS)[number] }[] =
  [
    { route: 'photos', card: TP_CREATE_IT_COLUMNS[0] },
    { route: 'idea', card: TP_CREATE_IT_COLUMNS[1] },
    { route: 'inspiration', card: TP_CREATE_IT_COLUMNS[2] },
  ]

type TradiesPostCreateRouteSelectorProps = {
  value: TradiesPostCreateRoute
  onChange: (route: TradiesPostCreateRoute) => void
  showIdeaRoute?: boolean
  /** When true, cards are unselected until clicked (main picker screen). */
  picking?: boolean
}

export function TradiesPostCreateRouteSelector({
  value,
  onChange,
  showIdeaRoute = true,
  picking = false,
}: TradiesPostCreateRouteSelectorProps) {
  const cards = ROUTE_CARDS.filter((entry) => showIdeaRoute || entry.route !== 'idea')

  return (
    <div className="space-y-3" data-testid="tp-create-route-selector">
      <div>
        <h2 className="text-sm font-black uppercase tracking-wide text-[#18181B]">
          Create it your way
        </h2>
        <p className="mt-1 text-sm text-zinc-600">
          Pick how you want to start - each card opens a different create path.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-[repeat(3,minmax(0,1fr))]">
        {cards.map(({ route, card }) => {
          const selected = !picking && value === route
          const copyId = `tp-create-route-copy-${route}`
          const actionLabel = selected ? ROUTE_SELECTED_LABELS[route] : ROUTE_ACTION_LABELS[route]

          return (
            <TradiesPostSelectableCard
              key={route}
              selected={selected}
              onClick={() => onChange(route)}
              testId={`tp-create-route-${route}`}
              ariaLabel={ROUTE_ARIA_LABELS[route]}
              aria-describedby={copyId}
              tone="default"
              className="flex h-full flex-col overflow-hidden bg-white p-0 text-left"
            >
              <div className="flex justify-center bg-transparent px-4 pt-4 sm:px-5 sm:pt-5">
                <div className="relative h-[8.75rem] w-full max-w-[15rem] sm:h-[9.5rem]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={card.image}
                    alt=""
                    width={card.width}
                    height={card.height}
                    className="h-auto w-full max-w-none"
                    style={{ clipPath: ROUTE_ILLUSTRATION_CLIP }}
                    loading="lazy"
                    decoding="async"
                  />
                </div>
              </div>

              <div id={copyId} className="flex flex-1 flex-col px-4 pb-4 pt-2 sm:px-5 sm:pb-5">
                <h3 className="text-sm font-black uppercase leading-snug tracking-wide text-[#18181B] sm:text-[0.9375rem]">
                  {card.title}
                </h3>
                <p className="mt-1.5 flex-1 text-sm leading-relaxed text-zinc-600">{card.body}</p>

                <span
                  className={
                    'mt-4 flex h-10 w-full items-center justify-center gap-1.5 rounded-xl text-xs font-black uppercase tracking-wide sm:text-sm ' +
                    (selected
                      ? 'bg-[#F5C518] text-[#18181B]'
                      : 'border-2 border-[#E4E4E7] bg-[#FAFAFA] text-[#18181B]')
                  }
                  aria-hidden
                >
                  {selected ? (
                    <>
                      <Check className="h-3.5 w-3.5 shrink-0" strokeWidth={3} aria-hidden />
                      {actionLabel}
                    </>
                  ) : (
                    <>
                      {actionLabel}
                      <ArrowRight className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />
                    </>
                  )}
                </span>
              </div>
            </TradiesPostSelectableCard>
          )
        })}
      </div>
    </div>
  )
}
