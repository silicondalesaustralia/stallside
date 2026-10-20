import { Pressable, StyleSheet, Text, View } from "react-native";
import type { MobileSupplierRow } from "@contracts/mobile/suppliers";
import { supplierStatusLabel } from "@/lib/supplier-labels";
import { colors, spacing } from "@/lib/theme";

type Props = { supplier: MobileSupplierRow; onPress: (id: string) => void };

export default function SupplierRow({ supplier, onPress }: Props) {
  const products = `${supplier.productCount} product${supplier.productCount === 1 ? "" : "s"}`;
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => onPress(supplier.id)}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <View style={styles.body}>
        <Text style={styles.title}>{supplier.name}</Text>
        <Text style={styles.meta}>{supplier.email}</Text>
        <Text style={styles.meta}>{products}</Text>
      </View>
      <Text
        style={supplier.status === "REVOKED" ? styles.revoked : styles.status}
      >
        {supplierStatusLabel(supplier.status)}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: 16,
    backgroundColor: colors.surface,
  },
  pressed: { opacity: 0.7 },
  body: { flex: 1, gap: 2 },
  title: { color: colors.text, fontSize: 16, fontWeight: "700" },
  meta: { color: colors.muted, fontSize: 13 },
  status: { color: colors.brand, fontSize: 13, fontWeight: "600" },
  revoked: { color: colors.danger, fontSize: 13, fontWeight: "600" },
});
