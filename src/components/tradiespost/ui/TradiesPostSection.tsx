import type { ReactNode } from 'react'

type TradiesPostSectionProps = {
  title?: string
  subtitle?: string
  children: ReactNode
  className?: string
  dark?: boolean
  id?: string
}

export function TradiesPostSection({
  title,
  subtitle,
  children,
  className = '',
  dark = false,
  id,
}: TradiesPostSectionProps) {
  return (
    <section id={id} className={`py-12 sm:py-16 lg:py-20 ${className}`}>
      {(title || subtitle) && (
        <div className="mb-8 text-center sm:mb-10">
          {title && (
            <h2
              className={`text-2xl font-black uppercase tracking-tight sm:text-3xl lg:text-4xl ${
                dark ? 'text-white' : 'text-[#18181B]'
              }`}
            >
              {title}
            </h2>
          )}
          {subtitle && (
            <p
              className={`mx-auto mt-3 max-w-2xl text-sm sm:text-base ${
                dark ? 'text-zinc-400' : 'text-zinc-600'
              }`}
            >
              {subtitle}
            </p>
          )}
        </div>
      )}
      {children}
    </section>
  )
}
