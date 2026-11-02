import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import type { RecipeDetailResponse } from "@contracts/mobile/recipes";
import { useToken } from "@/auth/useAuth";
import { useUnlinkRecipeProduct } from "@/data/useRecipeMutations";
import { formatCents } from "@/lib/format";
import { openOnWeb } from "@/lib/open-web";
import { formatPercent } from "@/lib/recipe-format";
import { colors, spacing } from "@/lib/theme";
import Card from "@/components/Card";
import LinkRecipeProductForm from "@/components/LinkRecipeProductForm";

type Product = RecipeDetailResponse["products"][number];

/** Products made from this recipe with unit cost and margin; packaging and pricing stay on the web. */
export default function RecipeProductsCard({
  data,
}: {
  data: RecipeDetailResponse;
}) {
  const token = useToken();
  const unlink = useUnlinkRecipeProduct(data.recipe.id);
  const yieldLabel = data.recipe.yieldLabel;

  function confirmUnlink(product: Product) {
    Alert.alert(
      `Unlink ${product.name}?`,
      "Batches can no longer add stock to it from this recipe.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Unlink",
          style: "destructive",
          onPress: () =>
            unlink.mutate(product.productId, {
              onError: (error) => Alert.alert("Couldn't unlink", error.message),
            }),
        },
      ],
    );
  }

  return (
    <Card title="Products and pricing">
      {data.products.map((p) => (
        <View key={p.productId} style={styles.row}>
          <Pressable
            style={styles.body}
            onPress={() =>
              router.push({
                pathname: "/product/[productId]",
                params: { productId: p.productId },
              })
            }
          >
            <Text style={styles.name}>{p.name}</Text>
            <Text style={styles.muted}>
              {p.yieldUnitsPerProduct} {yieldLabel} per product · packaging{" "}
              {formatCents(p.packagingCents, p.currency)} · {p.stockQuantity} in
              stock
            </Text>
            <Text style={styles.muted}>
              Costs {formatCents(p.unitCostCents, p.currency)} · sells{" "}
              {formatCents(p.priceCents, p.currency)} ·{" "}
              <Text
                style={
                  p.marginPercent != null && p.marginPercent < 0
                    ? styles.loss
                    : styles.margin
                }
              >
                {formatPercent(p.marginPercent)} margin
              </Text>
            </Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            disabled={unlink.isPending}
            onPress={() => confirmUnlink(p)}
          >
            <Text style={styles.remove}>Unlink</Text>
          </Pressable>
        </View>
      ))}
      <Pressable
        accessibilityRole="button"
        onPress={() =>
          void openOnWeb(
            `/dashboard/production/recipes/${data.recipe.id}`,
            token,
          )
        }
      >
        <Text style={styles.action}>
          Packaging and price calculator on the web
        </Text>
      </Pressable>
      {data.linkable.length > 0 ? <LinkRecipeProductForm data={data} /> : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  body: { flex: 1, gap: 2 },
  name: { color: colors.text, fontSize: 14, fontWeight: "600" },
  muted: { color: colors.muted, fontSize: 13 },
  margin: { color: colors.text, fontWeight: "600" },
  loss: { color: colors.danger, fontWeight: "700" },
  remove: { color: colors.danger, fontSize: 14, fontWeight: "600" },
  action: { color: colors.brand, fontSize: 14, fontWeight: "600" },
});
