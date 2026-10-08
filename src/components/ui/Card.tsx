import {
  CARD_NESTED,
  elevation,
  elevationHover,
  motion,
  radius,
  type ElevationLevel,
} from '@/lib/design/tokens'

type CardPadding = false | 'none' | 'sm' | 'md' | 'lg'

const paddingClasses: Record<'sm' | 'md' | 'lg', string> = {
  sm: 'p-4',
  md: 'p-5',
  lg: 'p-6',
}

const CARD_BASE = `${radius.xl} border border-warm-border bg-white`

interface CardProps {
  children: React.ReactNode
  className?: string
  /** @default 'md' - pass false or 'none' for no padding */
  padding?: CardPadding
  /** Bump shadow on hover (+1 elevation level) */
  interactive?: boolean
  /** Nested panel - warm bg, no shadow */
  nested?: boolean
  elevation?: ElevationLevel
  as?: 'div' | 'section' | 'article'
}

export function Card({
  children,
  className = '',
  padding = 'md',
  interactive = false,
  nested = false,
  elevation: elevationLevel = 'rest',
  as: Tag = 'div',
}: CardProps) {
  const surface = nested ? CARD_NESTED : CARD_BASE
  const elev = nested
    ? elevation.none
    : interactive
      ? elevationHover[elevationLevel]
      : elevation[elevationLevel]
  const pad =
    padding === false || padding === 'none' ? '' : paddingClasses[padding]

  return (
    <Tag className={[surface, elev, motion.shadow, pad, className].filter(Boolean).join(' ')}>
      {children}
    </Tag>
  )
}

export function CardHeader({
  title,
  description,
  action,
}: {
  title: string
  description?: string
  action?: React.ReactNode
}) {
  return (
    <div className="mb-4 flex items-start justify-between">
      <div>
        <h3 className="text-base font-semibold text-[#111]">{title}</h3>
        {description && <p className="mt-0.5 text-sm text-[#888]">{description}</p>}
      </div>
      {action}
    </div>
  )
}
