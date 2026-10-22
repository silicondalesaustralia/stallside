import { MEASURE_UNITS, unitLabel, type Unit } from "@/lib/production/unit-convert";
import { inputClass } from "./form-styles";

export default function UnitSelect({
  name,
  defaultValue,
  units = MEASURE_UNITS,
  label,
}: {
  name: string;
  defaultValue?: Unit | null;
  units?: readonly Unit[];
  label: string;
}) {
  return (
    <select name={name} defaultValue={defaultValue ?? units[0]} aria-label={label} className={inputClass}>
      {units.map((u) => (
        <option key={u} value={u}>
          {unitLabel(u)}
        </option>
      ))}
    </select>
  );
}
