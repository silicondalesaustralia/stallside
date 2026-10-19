import { Alert, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import type { CategoryDetailResponse } from "@contracts/mobile/categories";
import { useSaveCategoryProductOrder } from "@/data/useCategoryProducts";
import { moveItem } from "@/lib/move-item";
import { openProduct } from "@/lib/navigation";
import { colors, spacing } from "@/lib/theme";
import Card from "@/components/Card";
import OrderButtons from "@/components/OrderButtons";

/** Products in this category in shop order, with arrows to reorder and a link to choose which are in it. */
export default function CategoryProductsCard({
  detail,
}: {
  detail: CategoryDetailResponse;
}) {
  const saveOrder = useSaveCategoryProductOrder(detail.category.id);
  const { products } = detail;

  function move(index: number, direction: -1 | 1) {
    saveOrder.mutate(
      { ...detail, products: moveItem(products, index, direction) },
      { onError: (error) => Alert.alert("Couldn't save order", error.message) },
    );
  }

  const choose = (
    <Pressable
      accessibilityRole="button"
      onPress={() =>
        router.push({
          pathname: "/categories/[categoryId]/products",
          params: { categoryId: detail.category.id },
        })
      }
    >
      <Text style={styles.link}>Choose</Text>
    </Pressable>
  );

  return (
    <Card title={`Products (${products.length})`} action={choose}>
      {products.length === 0 ? (
        <Text style={styles.empty}>
          No products yet. Tap Choose to add some.
        </Text>
      ) : null}
      {products.map((product, index) => (
        <View key={product.id} style={styles.row}>
          <OrderButtons
            label={product.name}
            isFirst={index === 0}
            isLast={index === products.length - 1}
            disabled={saveOrder.isPending}
            onMove={(direction) => move(index, direction)}
          />
          {product.imageUrl ? (
            <Image source={{ uri: product.imageUrl }} style={styles.thumb} />
          ) : (
            <View style={styles.thumb} />
          )}
          <Pressable
            accessibilityRole="link"
            onPress={() => openProduct(product.id)}
            style={styles.body}
          >
            <Text style={styles.name}>{product.name}</Text>
            {product.detail || product.isHidden ? (
              <Text style={styles.meta}>
                {[product.detail, product.isHidden ? "Hidden" : null]
                  .filter(Boolean)
                  .join(" · ")}
              </Text>
            ) : null}
          </Pressable>
        </View>
      ))}
    </Card>
  );
}

const styles = StyleSheet.create({
  link: { color: colors.brand, fontWeight: "700" },
  empty: { color: colors.muted, fontSize: 14 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.xs,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  thumb: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: colors.background,
  },
  body: { flex: 1, gap: 2 },
  name: { color: colors.text, fontSize: 15, fontWeight: "600" },
  meta: { color: colors.muted, fontSize: 12 },
});
