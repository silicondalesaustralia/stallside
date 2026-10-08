'use client'

import { useCallback, useEffect, useId, useRef, useState } from 'react'
import Link from 'next/link'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import {
  computePopoverPlacement,
  hoverPreviewAllowed,
  nextInfoGuideState,
  type InfoGuideOpenReason,
} from '@/lib/ui/infoGuideBehavior'
import {
  getSocialHelp,
  type SocialHelpTopic,
  type SocialHelpTopicId,
} from '@/lib/social/socialHelpContent'
import { socialHelpTopicHref } from '@/lib/social/socialHelpAnchors'

const POPOVER_WIDTH = 288
const ESTIMATED_HEIGHT = 180

function useFineHover(): boolean {
  const [allowed, setAllowed] = useState(false)
  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return
    const query = window.matchMedia('(hover: hover) and (pointer: fine)')
    const sync = () => setAllowed(hoverPreviewAllowed(query.matches))
    sync()
    query.addEventListener('change', sync)
    return () => query.removeEventListener('change', sync)
  }, [])
  return allowed
}

export function InfoGuide({
  topic,
  content,
  className = '',
}: {
  topic?: SocialHelpTopicId
  content?: SocialHelpTopic
  className?: string
}) {
  const help = content ?? (topic ? getSocialHelp(topic) : null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const popoverRef = useRef<HTMLDivElement>(null)
  const [reason, setReason] = useState<InfoGuideOpenReason>('none')
  const [learnMoreOpen, setLearnMoreOpen] = useState(false)
  const [placement, setPlacement] = useState({ top: 0, left: 0, maxWidth: POPOVER_WIDTH })
  const hoverAllowed = useFineHover()
  const titleId = useId()
  const bodyId = useId()
  const open = reason !== 'none'

  const apply = useCallback(
    (event: Parameters<typeof nextInfoGuideState>[1]) => {
      setReason((current) => {
        const next = nextInfoGuideState(current, event, hoverAllowed)
        if (next === 'none') setLearnMoreOpen(false)
        return next
      })
    },
    [hoverAllowed],
  )

  const updatePlacement = useCallback(() => {
    const el = triggerRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const measured = popoverRef.current?.getBoundingClientRect()
    setPlacement(
      computePopoverPlacement({
        trigger: rect,
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
        popoverWidth: POPOVER_WIDTH,
        popoverHeight: measured?.height || ESTIMATED_HEIGHT,
      }),
    )
  }, [])

  useEffect(() => {
    if (!open) return
    updatePlacement()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') apply('escape')
    }
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node
      if (triggerRef.current?.contains(target)) return
      if (popoverRef.current?.contains(target)) return
      apply('outside')
    }
    window.addEventListener('keydown', onKey)
    window.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('resize', updatePlacement)
    window.addEventListener('scroll', updatePlacement, true)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('resize', updatePlacement)
      window.removeEventListener('scroll', updatePlacement, true)
    }
  }, [open, apply, updatePlacement])

  if (!help) return null

  const label = `About ${help.title}`

  return (
    <span
      className={`inline-flex align-middle ${className}`}
      onMouseEnter={() => apply('hover-enter')}
      onMouseLeave={() => apply('hover-leave')}
    >
      <button
        ref={triggerRef}
        type="button"
        className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#888] hover:bg-[#F4F1EA] hover:text-[#333] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFD100]"
        aria-label={label}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-controls={open ? titleId : undefined}
        data-testid={`info-guide-${topic ?? 'custom'}`}
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          apply('press')
        }}
      >
        <span
          aria-hidden
          className="flex h-4 w-4 items-center justify-center rounded-full border border-current text-[10px] font-black leading-none"
        >
          i
        </span>
      </button>
      {open &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            ref={popoverRef}
            role="dialog"
            aria-labelledby={titleId}
            aria-describedby={bodyId}
            data-testid="info-guide-popover"
            className="fixed z-[80] max-h-[min(70vh,320px)] overflow-y-auto rounded-xl border border-[#EDEAE2] bg-white p-3 shadow-lg"
            style={{
              top: placement.top,
              left: placement.left,
              width: placement.maxWidth,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-2">
              <p id={titleId} className="text-sm font-black text-[#111]">
                {help.title}
              </p>
              <button
                type="button"
                onClick={() => apply('escape')}
                className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[#888] hover:bg-[#F4F1EA]"
                aria-label="Close"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            <p id={bodyId} className="mt-1.5 text-xs leading-relaxed text-[#555]">
              {help.body}
            </p>
            {(help.learnMore || (topic && socialHelpTopicHref(topic))) && (
              <div className="mt-2 space-y-1.5">
                {help.learnMore && (
                  <div>
                    <button
                      type="button"
                      onClick={() => setLearnMoreOpen((v) => !v)}
                      className="text-[11px] font-semibold text-[#886600] hover:underline"
                      aria-expanded={learnMoreOpen}
                    >
                      {learnMoreOpen ? 'Show less' : 'Learn more'}
                    </button>
                    {learnMoreOpen && (
                      <p className="mt-1.5 text-xs leading-relaxed text-[#666]">{help.learnMore}</p>
                    )}
                  </div>
                )}
                {topic && socialHelpTopicHref(topic) && (
                  <Link
                    href={socialHelpTopicHref(topic)!}
                    className="block text-[11px] font-semibold text-[#886600] hover:underline"
                    data-testid={`info-guide-help-link-${topic}`}
                    onClick={() => apply('escape')}
                  >
                    {help.learnMore ? 'Open Help' : 'Learn more'}
                  </Link>
                )}
              </div>
            )}
          </div>,
          document.body,
        )}
    </span>
  )
}

export function InfoGuideLabel({
  topic,
  children,
  className = '',
}: {
  topic: SocialHelpTopicId
  children: React.ReactNode
  className?: string
}) {
  return (
    <span className={`inline-flex min-w-0 items-center gap-0.5 ${className}`}>
      {children}
      <InfoGuide topic={topic} />
    </span>
  )
}
