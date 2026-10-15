import { inputClass } from "./assistant-copy";

type Props = {
  label: string;
  hint?: string;
  value: string;
  onChange: (value: string) => void;
  maxLength: number;
  multiline?: boolean;
  placeholder?: string;
};

export default function AssistantField({ label, hint, value, onChange, maxLength, multiline, placeholder }: Props) {
  return (
    <label className="block text-sm">
      <span className="font-medium text-[var(--field)]">{label}</span>
      {hint ? <span className="mt-0.5 block text-xs text-[var(--muted)]">{hint}</span> : null}
      {multiline ? (
        <textarea
          className={`${inputClass} min-h-24`}
          value={value}
          maxLength={maxLength}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input
          className={inputClass}
          value={value}
          maxLength={maxLength}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </label>
  );
}
