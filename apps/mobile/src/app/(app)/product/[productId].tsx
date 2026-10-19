import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Stack, useLocalSearchParams } from "expo-router";
import { useToken } from "@/auth/useAuth";
import { useProduct } from "@/data/useProduct";
import { openOnWeb } from "@/lib/open-web";
import { colors, spacing } from "@/lib/theme";
import ProductSummaryCard from "@/components/ProductSummaryCard";
import ProductPhotosCard from "@/components/ProductPhotosCard";
import ProductPriceForm from "@/components/ProductPriceForm";
import ProductStockCard from "@/components/ProductStockCard";
import ProductStatusCard from "@/components/ProductStatusCard";
import ErrorMessage from "@/components/ErrorMessage";

export default function ProductDetailScreen() {
  const { productId } = useLocalSearchParams<{ productId: string }>();
  const token = useToken();
  const product = useProduct(productId);
  const detail = product.data;

  async function editOnWeb(path: string) {
    await openOnWeb(path, token);
    void product.refetch();
  }

  return (
    <>
      <Stack.Screen options={{ title: detail?.name ?? "Product" }} />
      {product.isPending ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.brand} />
        </View>
      ) : !detail ? (
        <View style={styles.center}>
          <ErrorMessage error={product.error} />
        </View>
      ) : (
        <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <ScrollView
            style={styles.screen}
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
          >
            <ProductSummaryCard product={detail} />
            <ProductPhotosCard product={detail} />
            <ProductPriceForm key={`${detail.priceCents}:${detail.compareAtPriceCents}`} product={detail} />
            <ProductStockCard product={detail} />
            <ProductStatusCard product={detail} />
            <Pressable accessibilityRole="link" onPress={() => void editOnWeb(detail.webPath)} style={styles.web}>
              <Text style={styles.webText}>Edit description, options & more on the web</Text>
            </Pressable>
          </ScrollView>
        </KeyboardAvoidingView>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: spacing.lg, backgroundColor: colors.background },
  screen: { backgroundColor: colors.background },
  content: { padding: spacing.md, gap: spacing.md, paddingBottom: spacing.lg * 2 },
  web: { alignItems: "center", padding: spacing.md },
  webText: { color: colors.brand, fontWeight: "600", fontSize: 15 },
});
