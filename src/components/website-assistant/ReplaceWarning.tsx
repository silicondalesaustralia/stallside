type Props = { isPublished: boolean; understood: boolean; onChange: (value: boolean) => void };

export default function ReplaceWarning({ isPublished, understood, onChange }: Props) {
  return (
    <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
      <p className="font-medium">This will replace your current website draft.</p>
      <ul className="mt-2 list-disc pl-5">
        <li>Page layouts, design and menu are replaced. Pages you don&apos;t select are switched off, not deleted.</li>
        <li>Your products, blog posts, domains, settings and any policy text you&apos;ve written are kept.</li>
        <li>You can restore your previous draft afterwards.</li>
        {isPublished ? <li>Your live website stays exactly as it is until you publish.</li> : null}
      </ul>
      <label className="mt-3 flex items-center gap-2">
        <input type="checkbox" checked={understood} onChange={(e) => onChange(e.target.checked)} />
        I understand my current draft will be replaced
      </label>
    </div>
  );
}
