import { Pressable, StyleSheet, Switch, Text, View } from "react-native";
import type { MobileCategory } from "@contracts/mobile/categories";
import { categoryDetail } from "@/lib/category-labels";
import { colors, spacing } from "@/lib/theme";
import OrderButtons from "@/components/OrderButtons";

type Props = {
  category: MobileCategory;
  isFirst: boolean;
  isLast: boolean;
  busy: boolean;
  onPress: (id: string) => void;
  onMove: (direction: -1 | 1) => void;
  onTogglePublished: (id: string, isActive: boolean) => void;
};

export default function CategoryRow({
  category,
  isFirst,
  isLast,
  busy,
  onPress,
  onMove,
  onTogglePublished,
}: Props) {
  return (
    <View style={styles.row}>
      <OrderButtons
        label={category.title}
        isFirst={isFirst}
        isLast={isLast}
        disabled={busy}
        onMove={onMove}
      />
      <Pressable
        accessibilityRole="button"
        onPress={() => onPress(category.id)}
        style={styles.body}
      >
        <Text style={styles.title}>{category.title}</Text>
        <Text style={styles.meta}>{categoryDetail(category)}</Text>
        <Text style={[styles.status, category.isActive && styles.live]}>
          {category.isActive ? "Published" : "Unpublished"}
        </Text>
      </Pressable>
      <Switch
        accessibilityLabel={`${category.title} published`}
        value={category.isActive}
        onValueChange={(value) => onTogglePublished(category.id, value)}
        trackColor={{ true: colors.brand }}
      />
    </View>
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
  body: { flex: 1, gap: 2 },
  title: { color: colors.text, fontSize: 16, fontWeight: "700" },
  meta: { color: colors.muted, fontSize: 13 },
  status: { color: colors.muted, fontSize: 12, fontWeight: "700" },
  live: { color: colors.brand },
});
