import type { ButtonHTMLAttributes, ReactNode } from 'react'
import Link from 'next/link'
import type {
  TradiesPostButtonSize,
  TradiesPostButtonSurface,
  TradiesPostButtonVariant,
} from '@/lib/tradiespost/tokens'

const sizeClasses: Record<TradiesPostButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs gap-1.5 rounded-lg min-h-[2rem]',
  md: 'px-5 py-2.5 text-sm gap-2 rounded-xl min-h-[2.5rem]',
  lg: 'px-6 py-3.5 text-sm gap-2 rounded-xl min-h-[3rem]',
}

const lightVariantClasses: Record<TradiesPostButtonVariant, string> = {
  primary:
    'bg-tradiespost-gold text-tradiespost-black hover:bg-tradiespost-gold-hover border border-transparent shadow-elevation-none font-black',
  secondary:
    'bg-tradiespost-surface-raised text-tradiespost-text border border-tradiespost-border hover:border-tradiespost-gold/40 font-semibold',
  tertiary:
    'bg-transparent text-tradiespost-text-muted hover:text-tradiespost-text border border-transparent font-semibold underline-offset-2 hover:underline',
  outline:
    'bg-transparent text-tradiespost-text border border-tradiespost-border hover:border-tradiespost-gold font-semibold',
  ghost:
    'bg-transparent text-tradiespost-text-muted hover:bg-tradiespost-surface-muted hover:text-tradiespost-text border border-transparent font-semibold',
  danger:
    'bg-tradiespost-danger text-white hover:bg-red-700 border border-transparent font-semibold',
}

const darkVariantClasses: Record<TradiesPostButtonVariant, string> = {
  primary:
    'bg-tradiespost-gold text-tradiespost-black hover:bg-tradiespost-gold-hover border border-transparent shadow-sm font-black',
  secondary:
    'bg-tradiespost-charcoal-raised text-white hover:bg-tradiespost-charcoal-border border border-tradiespost-charcoal-border font-semibold',
  tertiary:
    'bg-transparent text-tradiespost-steel-muted hover:text-white border border-transparent font-semibold underline-offset-2 hover:underline',
  outline:
    'bg-transparent text-white border border-zinc-600 hover:border-tradiespost-gold hover:text-tradiespost-gold font-semibold',
  ghost:
    'bg-transparent text-tradiespost-steel-muted hover:bg-tradiespost-charcoal-raised hover:text-white border border-transparent font-semibold',
  danger:
    'bg-tradiespost-danger text-white hover:bg-red-700 border border-transparent font-semibold',
}

type BaseProps = {
  variant?: TradiesPostButtonVariant
  size?: TradiesPostButtonSize
  surface?: TradiesPostButtonSurface
  children: ReactNode
  className?: string
  iconRight?: ReactNode
  iconLeft?: ReactNode
}

type ButtonProps = BaseProps &
  ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined }

type LinkProps = BaseProps & { href: string } & Omit<
    React.ComponentPropsWithoutRef<typeof Link>,
    'href' | 'className' | 'children'
  >

function buttonClasses(
  variant: TradiesPostButtonVariant,
  size: TradiesPostButtonSize,
  surface: TradiesPostButtonSurface,
  className: string,
) {
  const variants = surface === 'dark' ? darkVariantClasses : lightVariantClasses
  return `inline-flex items-center justify-center transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tradiespost-gold disabled:opacity-50 disabled:pointer-events-none ${variants[variant]} ${sizeClasses[size]} ${className}`
}

export function TradiesPostButton(props: ButtonProps | LinkProps) {
  const {
    variant = 'primary',
    size = 'md',
    surface = 'dark',
    children,
    className = '',
    iconRight,
    iconLeft,
    ...rest
  } = props

  const classes = buttonClasses(variant, size, surface, className)

  const content = (
    <>
      {iconLeft}
      {children}
      {iconRight}
    </>
  )

  if ('href' in props && props.href) {
    const { href, ...linkRest } = rest as LinkProps
    return (
      <Link href={href} className={classes} {...linkRest}>
        {content}
      </Link>
    )
  }

  return (
    <button type="button" className={classes} {...(rest as ButtonProps)}>
      {content}
    </button>
  )
}

/** Light-surface buttons for app pages (Create, Planner, Settings, etc.) */
export function TradiesPostButtonLight(
  props: (ButtonProps | LinkProps) & {
    variant?: Exclude<TradiesPostButtonVariant, 'ghost'> | 'ghost'
  },
) {
  return <TradiesPostButton {...props} surface="light" />
}
