/** TradiesPost presentation tokens - single source for TS/Tailwind references. */

export const TP = {
  gold: '#F5C518',
  goldHover: '#E6B800',
  goldMuted: '#B8860B',
  goldHighlight: '#FFF9E6',
  black: '#0B0B0B',
  charcoal: '#121212',
  charcoalRaised: '#1A1A1A',
  charcoalBorder: '#2A2A2A',
  steel: '#52525B',
  steelMuted: '#A1A1AA',
  surface: '#F7F6F2',
  surfaceRaised: '#FFFFFF',
  surfaceMuted: '#F0EFEB',
  border: '#E8E6E1',
  borderMuted: '#EDEAE2',
  text: '#18181B',
  textMuted: '#71717A',
  textOnDark: '#FFFFFF',
  textMutedOnDark: '#A1A1AA',
  danger: '#DC2626',
  dangerMuted: '#FEE2E2',
  radius: '12px',
  radiusLg: '16px',
  radiusPill: '9999px',
  sidebarWidth: '15rem',
  shadowCard: '0 4px 24px -4px rgb(10 10 10 / 0.12)',
  shadowRaised: '0 8px 32px -8px rgb(10 10 10 / 0.18)',
  shadowSubtle: '0 1px 2px 0 rgb(10 10 10 / 0.04), 0 1px 3px 0 rgb(10 10 10 / 0.06)',
} as const

export type TradiesPostButtonVariant =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'outline'
  | 'ghost'
  | 'danger'

export type TradiesPostButtonSize = 'sm' | 'md' | 'lg'

export type TradiesPostButtonSurface = 'light' | 'dark'

export type TradiesPostCardVariant =
  | 'standard'
  | 'feature'
  | 'highlight'
  | 'content'
  | 'empty'
  | 'dashed'
