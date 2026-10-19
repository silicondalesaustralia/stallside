import { Alert, Pressable, StyleSheet, Text } from "react-native";
import type { MobileProductDetail, ProductStatusBody } from "@contracts/mobile/product-detail";
import { useSetProductStatus } from "@/data/useProduct";
import { colors, spacing } from "@/lib/theme";
import Card from "@/components/Card";

type Action = { action: ProductStatusBody["action"]; label: string; confirm?: string };

const NOTE: Record<MobileProductDetail["status"], string> = {
  live: "Shown in your shop.",
  hidden: "Not listed in your shop - the direct link still works.",
  draft: "Not in your shop. Publish it to sell again.",
};

function actionsFor(status: MobileProductDetail["status"]): Action[] {
  if (status === "draft") return [{ action: "restore", label: "Publish" }];
  return [
    status === "hidden" ? { action: "show", label: "Show in shop" } : { action: "hide", label: "Hide from shop" },
    { action: "archive", label: "Move to drafts", confirm: "Customers won't be able to buy it until you publish it again." },
  ];
}

/** Same choices as the web product Status section; they apply straight away. */
export default function ProductStatusCard({ product }: { product: MobileProductDetail }) {
  const setStatus = useSetProductStatus(product.id);

  function run({ action }: Action) {
    setStatus.mutate({ action }, { onError: (error) => Alert.alert("Couldn't update product", error.message) });
  }

  function press(item: Action) {
    if (!item.confirm) return run(item);
    Alert.alert(`${item.label}?`, item.confirm, [
      { text: "Cancel", style: "cancel" },
      { text: item.label, style: "destructive", onPress: () => run(item) },
    ]);
  }

  return (
    <Card title="Status">
      <Text style={styles.note}>{NOTE[product.status]}</Text>
      {actionsFor(product.status).map((item) => (
        <Pressable
          key={item.action}
          accessibilityRole="button"
          disabled={setStatus.isPending}
          onPress={() => press(item)}
          style={({ pressed }) => [styles.button, (pressed || setStatus.isPending) && styles.dimmed]}
        >
          <Text style={[styles.label, item.action === "archive" && styles.danger]}>{item.label}</Text>
        </Pressable>
      ))}
    </Card>
  );
}

const styles = StyleSheet.create({
  note: { color: colors.muted, fontSize: 14 },
  button: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingVertical: spacing.sm + 4,
    alignItems: "center",
  },
  dimmed: { opacity: 0.6 },
  label: { color: colors.text, fontWeight: "600", fontSize: 15 },
  danger: { color: colors.danger },
});
