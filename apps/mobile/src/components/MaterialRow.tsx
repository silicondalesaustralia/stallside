import { Pressable, StyleSheet, Text, View } from "react-native";
import type { MobileMaterial } from "@contracts/mobile/materials";
import {
  MATERIAL_STATUS_LABEL,
  materialStatusColor,
} from "@/lib/material-labels";
import { colors, spacing } from "@/lib/theme";

type Props = { material: MobileMaterial; onPress: (id: string) => void };

/** Name, status, stock on hand and cost, like a row on the web Materials page. */
export default function MaterialRow({ material, onPress }: Props) {
  const meta = [
    material.kind === "PACKAGING" ? "Packaging" : null,
    material.sku ? `SKU ${material.sku}` : null,
    material.supplier,
  ].filter(Boolean);
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => onPress(material.id)}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <View style={styles.body}>
        <Text style={styles.name}>{material.name}</Text>
        {meta.length > 0 ? (
          <Text style={styles.meta}>{meta.join(" · ")}</Text>
        ) : null}
        <Text style={styles.meta}>{material.costLabel}</Text>
      </View>
      <View style={styles.side}>
        <Text style={styles.onHand}>{material.onHandLabel}</Text>
        <Text
          style={[
            styles.status,
            { color: materialStatusColor(material.status) },
          ]}
        >
          {MATERIAL_STATUS_LABEL[material.status]}
        </Text>
      </View>
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
  name: { color: colors.text, fontSize: 15, fontWeight: "700" },
  meta: { color: colors.muted, fontSize: 13 },
  side: { alignItems: "flex-end", gap: 2 },
  onHand: { color: colors.text, fontSize: 15, fontWeight: "600" },
  status: { fontSize: 12, fontWeight: "700" },
});
