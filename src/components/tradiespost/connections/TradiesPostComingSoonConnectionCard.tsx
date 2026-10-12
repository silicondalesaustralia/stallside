'use client'

import { TradiesPostProviderConnectionCard } from '@/components/tradiespost/connections/TradiesPostProviderConnectionCard'

export type ComingSoonConnectionPlatform = 'youtube' | 'pinterest' | 'x'

const BRAND_COLOURS: Record<ComingSoonConnectionPlatform, string> = {
  youtube: '#FF0000',
  pinterest: '#E60023',
  x: '#000000',
}

const BRAND_PATHS: Record<ComingSoonConnectionPlatform, string> = {
  youtube:
    'M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z',
  x: 'M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z',
  pinterest:
    'M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.026 11.985.026L12.017 0z',
}

const PLATFORM_COPY: Record<ComingSoonConnectionPlatform, { name: string; benefit: string }> = {
  youtube: {
    name: 'YouTube',
    benefit: 'Share Shorts of your stall, kitchen or harvest to your YouTube channel.',
  },
  pinterest: {
    name: 'Pinterest',
    benefit: 'Pin your products and recipes so new customers can find you.',
  },
  x: {
    name: 'X',
    benefit: 'Post quick updates like fresh stock and pre-order reminders to X.',
  },
}

export function TradiesPostComingSoonConnectionCard({
  platform,
}: {
  platform: ComingSoonConnectionPlatform
}) {
  const { name, benefit } = PLATFORM_COPY[platform]
  const icon = (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill={BRAND_COLOURS[platform]} aria-hidden>
      <path d={BRAND_PATHS[platform]} />
    </svg>
  )

  return (
    <TradiesPostProviderConnectionCard
      testId={`tp-connection-${platform}`}
      name={name}
      benefit={benefit}
      icon={icon}
      status="coming_soon"
    />
  )
}
