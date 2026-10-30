import {
  materialUnitLabel,
  type MaterialUnit,
} from "@contracts/mobile/material-units";
import ChipRow from "@/components/ChipRow";

type Props = {
  units: readonly MaterialUnit[];
  value: MaterialUnit;
  onChange: (unit: MaterialUnit) => void;
};

/** Unit picker limited to units that convert to the material's recipe unit. */
export default function UnitChips({ units, value, onChange }: Props) {
  return (
    <ChipRow
      options={units.map((u) => ({ value: u, label: materialUnitLabel(u) }))}
      value={value}
      onChange={onChange}
    />
  );
}
