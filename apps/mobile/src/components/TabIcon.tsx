import type { ColorValue } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

export type TabIconName = "home" | "receipt" | "pricetags" | "ellipsis-horizontal-circle";

export type TabIconRenderProps = {
  focused: boolean;
  color: ColorValue;
  size: number;
};

type Props = TabIconRenderProps & { name: TabIconName };

export default function TabIcon({ name, focused, color, size }: Props) {
  return <Ionicons name={focused ? name : `${name}-outline`} color={typeof color === "string" ? color : undefined} size={size} />;
}
