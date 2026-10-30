import { StyleSheet, Text } from "react-native";
import type { MaterialDetailResponse } from "@contracts/mobile/materials";
import {
  MATERIAL_STATUS_LABEL,
  materialStatusColor,
} from "@/lib/material-labels";
import { colors } from "@/lib/theme";
import Card from "@/components/Card";

type Props = {
  material: MaterialDetailResponse["material"];
  usedIn: MaterialDetailResponse["usedIn"];
};

/** Stock, cost and where a material is used, as at the top of the web material page. */
export default function MaterialSummaryCard({ material, usedIn }: Props) {
  const low = material.status === "reorder" || material.status === "out";
  return (
    <Card title={material.name}>
      <Text
        style={[styles.status, { color: materialStatusColor(material.status) }]}
      >
        {MATERIAL_STATUS_LABEL[material.status]}
        {material.kind === "PACKAGING" ? " · Packaging" : ""}
      </Text>
      <Text style={styles.big}>{material.onHandLabel} on hand</Text>
      {material.reorderLabel ? (
        <Text style={[styles.meta, low && styles.alert]}>
          Reorder at {material.reorderLabel}
        </Text>
      ) : null}
      <Text style={styles.meta}>
        {material.costLabel} · last pack {material.packLabel}
      </Text>
      {material.supplier ? (
        <Text style={styles.meta}>Supplier: {material.supplier}</Text>
      ) : null}
      {material.sku ? (
        <Text style={styles.meta}>SKU {material.sku}</Text>
      ) : null}
      {material.notes ? (
        <Text style={styles.meta}>{material.notes}</Text>
      ) : null}
      {usedIn.length > 0 ? (
        <Text style={styles.meta}>
          Used in: {usedIn.map((r) => r.name).join(", ")}
        </Text>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  status: { fontSize: 13, fontWeight: "700" },
  big: { color: colors.text, fontSize: 20, fontWeight: "700" },
  meta: { color: colors.muted, fontSize: 14 },
  alert: { color: colors.danger, fontWeight: "600" },
});
