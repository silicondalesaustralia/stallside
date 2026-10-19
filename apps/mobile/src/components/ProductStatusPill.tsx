import { StyleSheet, Text } from "react-native";
import type { ProductStatus } from "@contracts/mobile/product-detail";
import { colors, spacing } from "@/lib/theme";

const LABEL: Record<ProductStatus, string> = { live: "On sale", hidden: "Hidden", draft: "Draft" };
const TONE: Record<ProductStatus, { backgroundColor: string; color: string }> = {
  live: { backgroundColor: colors.background, color: colors.brand },
  hidden: { backgroundColor: "#fef3c7", color: "#78350f" },
  draft: { backgroundColor: "#fde8e6", color: colors.danger },
};

export default function ProductStatusPill({ status }: { status: ProductStatus }) {
  const tone = TONE[status];
  return <Text style={[styles.pill, tone]}>{LABEL[status]}</Text>;
}

const styles = StyleSheet.create({
  pill: {
    alignSelf: "flex-start",
    borderRadius: 999,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
    fontSize: 12,
    fontWeight: "700",
    overflow: "hidden",
  },
});
