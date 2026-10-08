import type { ReactNode } from 'react'

type TypographyTag = 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span' | 'div' | 'label'

type TypographyProps = {
  children: ReactNode
  className?: string
  as?: TypographyTag
}

export function TradiesPostPageTitle({ children, className = '', as: Tag = 'h1' }: TypographyProps) {
  return <Tag className={`tp-page-title ${className}`}>{children}</Tag>
}

export function TradiesPostSectionTitle({
  children,
  className = '',
  as: Tag = 'h2',
}: TypographyProps) {
  return <Tag className={`tp-section-title ${className}`}>{children}</Tag>
}

export function TradiesPostCardTitle({ children, className = '', as: Tag = 'h3' }: TypographyProps) {
  return <Tag className={`tp-card-title ${className}`}>{children}</Tag>
}

export function TradiesPostBody({ children, className = '', as: Tag = 'p' }: TypographyProps) {
  return <Tag className={`tp-body ${className}`}>{children}</Tag>
}

export function TradiesPostMeta({ children, className = '', as: Tag = 'p' }: TypographyProps) {
  return <Tag className={`tp-meta ${className}`}>{children}</Tag>
}

export function TradiesPostLabel({ children, className = '', as: Tag = 'span' }: TypographyProps) {
  return <Tag className={`tp-label ${className}`}>{children}</Tag>
}
