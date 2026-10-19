import { Pressable, ScrollView, StyleSheet, Text } from "react-native";
import { useBusiness } from "@/business/useBusiness";
import { colors, spacing } from "@/lib/theme";

/** Chips for owners with more than one business; hidden when there is only one. */
export default function BusinessSwitcher() {
  const { businesses, selected, select } = useBusiness();
  if (businesses.length < 2) return null;

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {businesses.map((business) => {
        const active = business.id === selected?.id;
        return (
          <Pressable
            key={business.id}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            onPress={() => select(business.id)}
            style={[styles.chip, active && styles.chipActive]}
          >
            <Text style={[styles.label, active && styles.labelActive]}>{business.name}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { gap: spacing.sm, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  chip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  chipActive: { backgroundColor: colors.brand, borderColor: colors.brand },
  label: { color: colors.text, fontWeight: "600" },
  labelActive: { color: colors.brandText },
});
