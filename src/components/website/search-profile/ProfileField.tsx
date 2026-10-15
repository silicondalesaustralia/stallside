export const profileInputClass =
  "mt-1 w-full rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-sm";

type Props = {
  label: string;
  name: string;
  defaultValue?: string | number | string[] | null;
  hint?: string;
  placeholder?: string;
  type?: "text" | "url" | "email" | "tel" | "number" | "time";
  /** A textarea, one item per line; array values are joined by line. */
  multiline?: boolean;
  step?: string;
};

/** One labelled input in the search profile form. */
export default function ProfileField({ label, name, defaultValue, hint, placeholder, type = "text", multiline, step }: Props) {
  const value = Array.isArray(defaultValue) ? defaultValue.join("\n") : (defaultValue ?? "");
  return (
    <label className="block text-sm">
      <span className="font-medium">{label}</span>
      {multiline ? (
        <textarea name={name} rows={3} defaultValue={String(value)} placeholder={placeholder} className={profileInputClass} />
      ) : (
        <input
          name={name}
          type={type}
          step={step}
          defaultValue={String(value)}
          placeholder={placeholder}
          className={profileInputClass}
        />
      )}
      {hint ? <span className="mt-1 block text-xs text-[var(--muted)]">{hint}</span> : null}
    </label>
  );
}
