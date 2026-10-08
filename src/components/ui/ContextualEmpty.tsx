import Link from 'next/link'

const CTA_CLASS =
  'mt-2 inline-flex items-center rounded-lg bg-[#FFD100] px-3 py-1.5 text-sm font-semibold text-black hover:bg-yellow-400'

export function ContextualEmpty({
  title,
  description,
  href,
  cta,
  onClick,
}: {
  title: string
  description?: string
  href?: string
  cta?: string
  onClick?: () => void
}) {
  return (
    <div className="max-w-md">
      <p className="text-sm font-semibold text-gray-900">{title}</p>
      {description ? <p className="mt-0.5 text-sm text-gray-500">{description}</p> : null}
      {href && cta ? (
        <Link href={href} className={CTA_CLASS}>
          {cta}
        </Link>
      ) : onClick && cta ? (
        <button type="button" onClick={onClick} className={CTA_CLASS}>
          {cta}
        </button>
      ) : null}
    </div>
  )
}
