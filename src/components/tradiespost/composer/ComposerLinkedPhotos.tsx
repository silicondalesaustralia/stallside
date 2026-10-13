'use client'

type Props = {
  urls: string[]
  onPick: (url: string) => void
}

/** Photos from the linked product / pre-order page, offered alongside upload / Library / AI. */
export function ComposerLinkedPhotos({ urls, onPick }: Props) {
  if (!urls.length) return null
  return (
    <div className="mb-3" data-testid="composer-linked-photos">
      <p className="mb-1.5 text-xs font-semibold text-zinc-600">Use a photo from the item you picked</p>
      <div className="flex flex-wrap gap-2">
        {urls.map((url) => (
          <button
            key={url}
            type="button"
            onClick={() => onPick(url)}
            className="size-20 overflow-hidden rounded-xl border-2 border-[#E4E4E7] hover:border-[#F5C518]"
            aria-label="Use this photo"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt="" className="h-full w-full object-cover" />
          </button>
        ))}
      </div>
    </div>
  )
}
