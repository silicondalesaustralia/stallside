type IconProps = { className?: string }

export function YouTubeBrandIcon({ className = 'h-6 w-6' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        fill="#FF0000"
        d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31.4 31.4 0 0 0 0 12a31.4 31.4 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31.4 31.4 0 0 0 24 12a31.4 31.4 0 0 0-.5-5.8Z"
      />
      <path fill="#FFFFFF" d="m9.6 15.6 6.2-3.6-6.2-3.6v7.2Z" />
    </svg>
  )
}

export function PinterestBrandIcon({ className = 'h-6 w-6' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <circle cx="12" cy="12" r="12" fill="#E60023" />
      <path
        fill="#FFFFFF"
        d="M12.3 4.5c-4.1 0-6.2 2.9-6.2 5.4 0 1.5.6 2.8 1.8 3.3.2.1.4 0 .4-.2l.2-.7c.1-.2 0-.3-.1-.5-.4-.4-.6-1-.6-1.8 0-2.3 1.7-4.4 4.5-4.4 2.5 0 3.8 1.5 3.8 3.5 0 2.6-1.2 4.9-2.9 4.9-1 0-1.7-.8-1.4-1.8.3-1.1.8-2.4.8-3.2 0-.7-.4-1.4-1.2-1.4-1 0-1.7 1-1.7 2.3 0 .8.3 1.4.3 1.4l-1.1 4.7c-.3 1.4 0 3.1 0 3.3 0 .1.1.1.2 0 .1-.1 1-1.3 1.4-2.6l.5-2.1c.3.5 1.1 1 2 1 2.6 0 4.4-2.4 4.4-5.6 0-2.4-2-4.6-5.1-4.6Z"
      />
    </svg>
  )
}
