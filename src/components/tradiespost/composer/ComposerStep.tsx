import type { ReactNode } from 'react'

type Props = {
  number: number
  title: string
  children: ReactNode
}

export function ComposerStep({ number, title, children }: Props) {
  return (
    <section className="rounded-2xl border border-[#E4E4E7] bg-white p-4 sm:p-5">
      <h2 className="mb-3 flex items-center gap-2 text-sm font-black text-[#18181B]">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#F5C518] text-xs">
          {number}
        </span>
        {title}
      </h2>
      {children}
    </section>
  )
}
