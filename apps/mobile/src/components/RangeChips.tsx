import type { HomeRange } from "@contracts/mobile/home";
import ChipRow from "@/components/ChipRow";

const OPTIONS = [
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "7d", label: "7 days" },
  { value: "30d", label: "30 days" },
] as const satisfies readonly { value: HomeRange; label: string }[];

type Props = {
  value: HomeRange;
  onChange: (range: HomeRange) => void;
};

export default function RangeChips({ value, onChange }: Props) {
  return <ChipRow options={OPTIONS} value={value} onChange={onChange} />;
}
