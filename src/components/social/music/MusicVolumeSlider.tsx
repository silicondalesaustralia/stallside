'use client'

type Props = {
  label: string
  value: number
  onChange: (value: number) => void
}

export function MusicVolumeSlider({ label, value, onChange }: Props) {
  return (
    <label className="block">
      <span className="flex justify-between text-xs font-bold text-zinc-600">
        {label}
        <span className="font-semibold text-zinc-500">{Math.round(value * 100)}%</span>
      </span>
      <input
        type="range"
        min={0}
        max={100}
        step={5}
        value={Math.round(value * 100)}
        onChange={(e) => onChange(Number(e.target.value) / 100)}
        className="w-full accent-[#18181B]"
      />
    </label>
  )
}
