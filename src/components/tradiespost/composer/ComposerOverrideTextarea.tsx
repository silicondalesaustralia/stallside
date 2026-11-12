'use client'

type Props = {
  id: string
  label: string
  /** This platform's own text; blank means it uses the main caption. */
  value: string
  onChange: (value: string) => void
  mainCaption: string
  limit: number
}

export function ComposerOverrideTextarea({ id, label, value, onChange, mainCaption, limit }: Props) {
  const custom = Boolean(value.trim())
  const length = (custom ? value : mainCaption).length
  const over = length > limit

  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <label htmlFor={id} className="text-sm font-bold text-[#18181B]">{label}</label>
        {custom && (
          <button type="button" onClick={() => onChange('')} className="text-xs font-bold text-[#18181B] underline">
            Use main caption
          </button>
        )}
      </div>
      <textarea
        id={id}
        rows={5}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={mainCaption.trim() ? `Uses your main caption:\n${mainCaption.trim()}` : 'Uses your main caption. Write something here to change it for this platform only.'}
        className="mt-1 block w-full resize-y rounded-xl border border-[#E4E4E7] bg-white p-3 text-sm leading-relaxed text-[#18181B] outline-none focus:border-[#F5C518] focus:ring-1 focus:ring-[#F5C518]"
        data-testid={id}
      />
      <span className={`mt-1 block text-xs tabular-nums ${over ? 'font-bold text-red-600' : 'text-zinc-500'}`}>
        {custom ? 'Custom for this platform' : 'Using main caption'} · {length.toLocaleString()} / {limit.toLocaleString()}
      </span>
    </div>
  )
}
