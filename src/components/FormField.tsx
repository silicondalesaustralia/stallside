export default function FormField({
  label,
  name,
  required,
  placeholder,
}: {
  label: string;
  name: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="flex flex-col gap-2 text-sm">
      <span className="font-medium">{label}</span>
      <input
        name={name}
        required={required}
        placeholder={placeholder}
        className="rounded-lg border border-[var(--line)] bg-white px-3 py-2.5 outline-none ring-[var(--leaf)] focus:ring-2"
      />
    </label>
  );
}
