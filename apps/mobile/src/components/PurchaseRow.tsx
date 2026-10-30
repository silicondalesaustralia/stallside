import { Pressable, StyleSheet, Text, View } from "react-native";
import type { MobilePurchase } from "@contracts/mobile/materials";
import { formatCents } from "@/lib/format";
import { dayLabel } from "@/lib/material-labels";
import { openLink } from "@/lib/open-link";
import { colors, spacing } from "@/lib/theme";

type Props = {
  purchase: MobilePurchase;
  currency: string;
  removing: boolean;
  onRemove: (purchase: MobilePurchase) => void;
};

/** One delivery of a material, like a row in the web purchase history. */
export default function PurchaseRow({
  purchase,
  currency,
  removing,
  onRemove,
}: Props) {
  const lot = [
    purchase.lotCode ? `Lot ${purchase.lotCode}` : null,
    purchase.expiresOn ? `exp ${dayLabel(purchase.expiresOn)}` : null,
  ].filter(Boolean);
  const invoice = purchase.invoiceNumber
    ? `Invoice ${purchase.invoiceNumber}`
    : "View invoice";
  return (
    <View style={styles.row}>
      <View style={styles.body}>
        <Text style={styles.title}>
          {purchase.quantityLabel} ·{" "}
          {formatCents(purchase.totalCents, currency)}
        </Text>
        <Text style={styles.meta}>
          {dayLabel(purchase.receivedOn)}
          {purchase.supplier ? ` · ${purchase.supplier}` : ""}
        </Text>
        {lot.length > 0 ? (
          <Text style={styles.meta}>{lot.join(" · ")}</Text>
        ) : null}
        {purchase.receiptUrl ? (
          <Text
            style={styles.link}
            onPress={() => void openLink(purchase.receiptUrl ?? "")}
          >
            {invoice}
          </Text>
        ) : purchase.invoiceNumber ? (
          <Text style={styles.meta}>{invoice}</Text>
        ) : null}
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Remove purchase"
        disabled={removing}
        onPress={() => onRemove(purchase)}
        style={({ pressed }) => [
          styles.remove,
          (pressed || removing) && styles.dim,
        ]}
      >
        <Text style={styles.removeText}>
          {removing ? "Removing…" : "Remove"}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  body: { flex: 1, gap: 2 },
  title: { color: colors.text, fontSize: 15, fontWeight: "600" },
  meta: { color: colors.muted, fontSize: 13 },
  link: { color: colors.brand, fontSize: 13, fontWeight: "600" },
  remove: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: spacing.sm + 4,
    paddingVertical: spacing.xs + 2,
  },
  dim: { opacity: 0.6 },
  removeText: { color: colors.danger, fontSize: 13, fontWeight: "600" },
});
