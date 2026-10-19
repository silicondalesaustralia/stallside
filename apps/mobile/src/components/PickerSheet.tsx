import { useState } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { UpsellOption } from "@contracts/mobile/upsells";
import { colors, spacing } from "@/lib/theme";
import CheckRow from "@/components/CheckRow";
import SearchInput from "@/components/SearchInput";

type Props = {
  visible: boolean;
  title: string;
  options: UpsellOption[];
  selected: string[];
  /** Single choice closes the sheet as soon as something is picked. */
  multiple: boolean;
  onChange: (ids: string[]) => void;
  onClose: () => void;
};

/** Full-screen searchable checklist for picking products or categories. */
export default function PickerSheet({
  visible,
  title,
  options,
  selected,
  multiple,
  onChange,
  onClose,
}: Props) {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const matches = q
    ? options.filter((o) => o.label.toLowerCase().includes(q))
    : options;
  const chosen = new Set(selected);

  function toggle(id: string) {
    if (!multiple) {
      onChange([id]);
      onClose();
      return;
    }
    onChange(
      chosen.has(id) ? selected.filter((s) => s !== id) : [...selected, id],
    );
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.sheet}>
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <Pressable accessibilityRole="button" onPress={onClose} hitSlop={12}>
            <Text style={styles.done}>Done</Text>
          </Pressable>
        </View>
        {options.length > 8 ? (
          <SearchInput value={query} onChange={setQuery} placeholder="Search" />
        ) : null}
        <FlatList
          data={matches}
          keyExtractor={(option) => option.id}
          contentContainerStyle={styles.list}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => (
            <CheckRow
              label={item.label}
              checked={chosen.has(item.id)}
              onToggle={() => toggle(item.id)}
            />
          )}
          ListEmptyComponent={
            <Text style={styles.empty}>
              {options.length ? "No matches." : "Nothing to pick yet."}
            </Text>
          }
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  sheet: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.md,
    gap: spacing.sm,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.sm,
  },
  title: { color: colors.text, fontSize: 18, fontWeight: "700" },
  done: { color: colors.brand, fontSize: 16, fontWeight: "700" },
  list: { gap: spacing.xs, paddingBottom: spacing.lg * 2 },
  empty: { color: colors.muted, textAlign: "center", marginTop: spacing.lg },
});
