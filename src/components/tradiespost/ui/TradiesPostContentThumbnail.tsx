import Image from 'next/image'
import type { ReactNode } from 'react'
import type { TradiesPostStatus } from '@/lib/tradiespost/status'
import { TradiesPostStatusBadge } from './TradiesPostStatusBadge'

type TradiesPostContentThumbnailProps = {
  src?: string | null
  alt: string
  title?: string
  meta?: ReactNode
  status?: TradiesPostStatus
  statusLabel?: string
  aspect?: 'square' | 'portrait' | 'landscape'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  onClick?: () => void
  href?: string
  placeholderIcon?: ReactNode
}

const aspectClasses = {
  square: 'aspect-square',
  portrait: 'aspect-[4/5]',
  landscape: 'aspect-[4/3]',
}

const sizeClasses = {
  sm: 'w-16',
  md: 'w-full',
  lg: 'w-full',
}

function ThumbnailFrame({
  src,
  alt,
  aspect,
  placeholderIcon,
}: Pick<TradiesPostContentThumbnailProps, 'src' | 'alt' | 'aspect' | 'placeholderIcon'>) {
  return (
    <div
      className={`relative overflow-hidden rounded-xl bg-tradiespost-surface-muted ${aspectClasses[aspect ?? 'square']}`}
    >
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 80px, 160px"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-tradiespost-steel-muted">
          {placeholderIcon ?? (
            <svg
              aria-hidden
              className="h-8 w-8 opacity-40"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z"
              />
            </svg>
          )}
        </div>
      )}
    </div>
  )
}

/** Image-led card for posts, library items, calendar previews */
export function TradiesPostContentThumbnail({
  src,
  alt,
  title,
  meta,
  status,
  statusLabel,
  aspect = 'square',
  size = 'md',
  className = '',
  onClick,
  placeholderIcon,
}: TradiesPostContentThumbnailProps) {
  const interactive = Boolean(onClick)
  const Wrapper = interactive ? 'button' : 'div'

  return (
    <Wrapper
      type={interactive ? 'button' : undefined}
      onClick={onClick}
      className={`group w-full text-left ${sizeClasses[size]} ${interactive ? 'cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tradiespost-gold' : ''} ${className}`}
    >
      <div className="overflow-hidden rounded-2xl border border-tradiespost-border bg-tradiespost-surface-raised shadow-elevation-none transition-shadow group-hover:shadow-elevation-rest">
        <ThumbnailFrame src={src} alt={alt} aspect={aspect} placeholderIcon={placeholderIcon} />
        {(title || meta || status) && (
          <div className="space-y-1.5 p-3">
            {title && <p className="tp-card-title line-clamp-2">{title}</p>}
            {status && (
              <TradiesPostStatusBadge status={status} label={statusLabel} dot className="w-fit" />
            )}
            {meta && <p className="tp-meta line-clamp-1">{meta}</p>}
          </div>
        )}
      </div>
    </Wrapper>
  )
}

/** Horizontal content row - activity feeds, approval queues */
export function TradiesPostContentRow({
  src,
  alt,
  title,
  meta,
  status,
  statusLabel,
  trailing,
  onClick,
  className = '',
}: TradiesPostContentThumbnailProps & { trailing?: ReactNode }) {
  const interactive = Boolean(onClick)
  const Wrapper = interactive ? 'button' : 'div'

  return (
    <Wrapper
      type={interactive ? 'button' : undefined}
      onClick={onClick}
      className={`flex w-full gap-3 rounded-2xl border border-tradiespost-border bg-tradiespost-surface-raised p-3 text-left shadow-elevation-none transition-shadow ${interactive ? 'cursor-pointer hover:shadow-elevation-rest focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tradiespost-gold' : ''} ${className}`}
    >
      <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-tradiespost-surface-muted">
        {src ? (
          <Image src={src} alt={alt} fill className="object-cover" sizes="64px" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-tradiespost-steel-muted">
            <span className="text-xs font-semibold">Post</span>
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        {title && <p className="tp-card-title truncate">{title}</p>}
        {status && (
          <TradiesPostStatusBadge status={status} label={statusLabel} dot className="mt-1 w-fit" />
        )}
        {meta && <p className="tp-meta mt-1 truncate">{meta}</p>}
      </div>
      {trailing && <div className="flex-shrink-0 self-center">{trailing}</div>}
    </Wrapper>
  )
}
