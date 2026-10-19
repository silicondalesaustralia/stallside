import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { UpsellOption } from "@contracts/mobile/upsells";
import { colors, spacing } from "@/lib/theme";
import PickerSheet from "@/components/PickerSheet";

type Props = {
  label: string;
  options: UpsellOption[];
  selected: string[];
  multiple: boolean;
  placeholder: string;
  onChange: (ids: string[]) => void;
};

function summary(
  options: UpsellOption[],
  selected: string[],
  placeholder: string,
): string {
  if (selected.length === 0) return placeholder;
  const first = options.find((o) => o.id === selected[0])?.label ?? "1 chosen";
  return selected.length === 1 ? first : `${selected.length} chosen`;
}

/** Labelled row showing the current choice; tapping opens a picker sheet. */
export default function PickerField({
  label,
  options,
  selected,
  multiple,
  placeholder,
  onChange,
}: Props) {
  const [open, setOpen] = useState(false);
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${summary(options, selected, placeholder)}`}
        onPress={() => setOpen(true)}
        style={({ pressed }) => [styles.input, pressed && styles.pressed]}
      >
        <Text
          style={selected.length ? styles.value : styles.placeholder}
          numberOfLines={1}
        >
          {summary(options, selected, placeholder)}
        </Text>
        <Text style={styles.chevron}>›</Text>
      </Pressable>
      <PickerSheet
        visible={open}
        title={label}
        options={options}
        selected={selected}
        multiple={multiple}
        onChange={onChange}
        onClose={() => setOpen(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: spacing.xs },
  label: { color: colors.muted, fontSize: 13, fontWeight: "600" },
  input: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    backgroundColor: colors.surface,
  },
  pressed: { opacity: 0.7 },
  value: { flex: 1, color: colors.text, fontSize: 16 },
  placeholder: { flex: 1, color: colors.placeholder, fontSize: 16 },
  chevron: { color: colors.muted, fontSize: 20 },
});
