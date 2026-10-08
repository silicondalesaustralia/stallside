'use client'

export function InspirationPreviewCard({
  src,
  onReplace,
}: {
  src: string
  onReplace: () => void
}) {
  return (
    <div
      className="rounded-xl border border-indigo-100 bg-white p-4 shadow-sm"
      data-testid="inspiration-preview-card"
    >
      <p className="text-[10px] font-black uppercase tracking-widest text-indigo-600">
        Your inspiration
      </p>
      <div className="mt-3 overflow-hidden rounded-lg border border-[#EDEAE2] bg-[#F7F5F0]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt="Uploaded inspiration"
          className="mx-auto max-h-64 w-full object-contain sm:max-h-56"
        />
      </div>
      <p className="mt-3 text-[11px] leading-relaxed text-[#888]">
        Used temporarily for this generation and then deleted.
      </p>
      <button
        type="button"
        onClick={onReplace}
        className="mt-2 text-xs font-semibold text-indigo-600 hover:underline"
        data-testid="inspiration-replace-image"
      >
        Replace image
      </button>
    </div>
  )
}
