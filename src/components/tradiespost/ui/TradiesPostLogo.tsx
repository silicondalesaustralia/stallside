import Link from 'next/link'
import { TP_ASSETS } from '@/lib/tradiespost/assets'

type TradiesPostLogoProps = {
  className?: string
  /** Kept for API compatibility; tagline is baked into the logo asset. */
  showTagline?: boolean
  dark?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const sizeClasses = {
  sm: 'h-8 w-auto max-w-[160px] sm:max-w-[180px]',
  md: 'h-10 w-auto max-w-[200px] sm:max-w-[220px]',
  lg: 'h-14 w-auto max-w-[280px] sm:h-16 sm:max-w-[320px]',
}

export function TradiesPostLogo({
  className = '',
  size = 'md',
}: TradiesPostLogoProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={TP_ASSETS.logoHorizontal}
      alt="TradiesPost - your social media sidekick"
      width={TP_ASSETS.logoWidth}
      height={TP_ASSETS.logoHeight}
      className={`block object-contain object-left ${sizeClasses[size]} ${className}`.trim()}
      loading="eager"
      decoding="async"
    />
  )
}

export function TradiesPostLogoLink(props: TradiesPostLogoProps & { href?: string }) {
  const { href = '/', className = '', ...rest } = props
  return (
    <Link
      href={href}
      className={`inline-block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F5C518] ${className}`.trim()}
      aria-label="TradiesPost home"
    >
      <TradiesPostLogo {...rest} />
    </Link>
  )
}
