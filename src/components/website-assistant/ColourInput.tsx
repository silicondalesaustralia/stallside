type Props = { label: string; value: string | null; onChange: (value: string) => void };

export default function ColourInput({ label, value, onChange }: Props) {
  return (
    <label className="flex items-center gap-2 text-sm text-[var(--field)]">
      <input type="color" value={value ?? "#2f5d3a"} onChange={(e) => onChange(e.target.value)} />
      {label}
    </label>
  );
}
