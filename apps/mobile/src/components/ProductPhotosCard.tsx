import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
} from "react-native";
import {
  PRODUCT_PHOTOS_LIMIT,
  type MobileProductDetail,
} from "@contracts/mobile/product-detail";
import {
  useAddProductPhoto,
  useRemoveProductPhoto,
  useReorderProductPhotos,
} from "@/data/useProduct";
import { pickPhoto } from "@/lib/pick-photo";
import { colors, spacing } from "@/lib/theme";
import Card from "@/components/Card";

/** Add from camera or library, make main, remove: the same rules as the web Photos card. */
export default function ProductPhotosCard({
  product,
}: {
  product: MobileProductDetail;
}) {
  const add = useAddProductPhoto(product.id);
  const remove = useRemoveProductPhoto(product.id);
  const reorder = useReorderProductPhotos(product.id);
  const busy = add.isPending || remove.isPending || reorder.isPending;
  const full = product.photos.length >= PRODUCT_PHOTOS_LIMIT;
  const failed = (title: string) => (error: Error) =>
    Alert.alert(title, error.message);

  async function addFrom(source: "camera" | "library") {
    try {
      const photo = await pickPhoto(source);
      if (photo) add.mutate(photo, { onError: failed("Couldn't add photo") });
    } catch (error) {
      Alert.alert(
        "Couldn't open photos",
        error instanceof Error ? error.message : "Try again.",
      );
    }
  }

  function chooseSource() {
    Alert.alert("Add a photo", undefined, [
      { text: "Take photo", onPress: () => void addFrom("camera") },
      { text: "Choose from library", onPress: () => void addFrom("library") },
      { text: "Cancel", style: "cancel" },
    ]);
  }

  function photoMenu(url: string, index: number) {
    const makeMain = () =>
      reorder.mutate([url, ...product.photos.filter((u) => u !== url)], {
        onError: failed("Couldn't move photo"),
      });
    Alert.alert(index === 0 ? "Main photo" : "Photo", undefined, [
      ...(index > 0 ? [{ text: "Make main photo", onPress: makeMain }] : []),
      {
        text: "Remove",
        style: "destructive" as const,
        onPress: () =>
          remove.mutate(url, { onError: failed("Couldn't remove photo") }),
      },
      { text: "Cancel", style: "cancel" as const },
    ]);
  }

  return (
    <Card
      title={`Photos (${product.photos.length}/${PRODUCT_PHOTOS_LIMIT})`}
      action={busy ? <ActivityIndicator color={colors.brand} /> : null}
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      >
        {product.photos.map((url, index) => (
          <Pressable
            key={url}
            accessibilityRole="button"
            accessibilityLabel={
              index === 0 ? "Main photo" : `Photo ${index + 1}`
            }
            disabled={busy}
            onPress={() => photoMenu(url, index)}
          >
            <Image source={{ uri: url }} style={styles.photo} />
            {index === 0 ? <Text style={styles.main}>Main</Text> : null}
          </Pressable>
        ))}
        {!full ? (
          <Pressable
            accessibilityRole="button"
            disabled={busy}
            onPress={chooseSource}
            style={[styles.photo, styles.add]}
          >
            <Text style={styles.plus}>+</Text>
            <Text style={styles.addLabel}>Add photo</Text>
          </Pressable>
        ) : null}
      </ScrollView>
      <Text style={styles.hint}>
        Tap a photo to make it the main one or remove it.
      </Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  row: { gap: spacing.sm },
  photo: {
    width: 96,
    height: 96,
    borderRadius: 12,
    backgroundColor: colors.background,
  },
  main: {
    position: "absolute",
    left: 6,
    bottom: 6,
    overflow: "hidden",
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: colors.brand,
    color: colors.brandText,
    fontSize: 11,
    fontWeight: "700",
  },
  add: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: colors.border,
  },
  plus: { color: colors.brand, fontSize: 28, lineHeight: 30 },
  addLabel: { color: colors.brand, fontSize: 12, fontWeight: "600" },
  hint: { color: colors.muted, fontSize: 12 },
});
