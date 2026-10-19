import { useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { colors, spacing } from "@/lib/theme";

type Props = {
  value: number;
  saving: boolean;
  onSave: (quantity: number) => void;
};

export default function StockStepper({ value, saving, onSave }: Props) {
  const [draft, setDraft] = useState<number | null>(null);
  const current = draft ?? value;
  const dirty = draft !== null && draft !== value;

  function set(next: number) {
    setDraft(Math.max(0, next));
  }

  return (
    <View style={styles.row}>
      <Pressable accessibilityLabel="One less" onPress={() => set(current - 1)} style={styles.step}>
        <Text style={styles.stepText}>−</Text>
      </Pressable>
      <TextInput
        accessibilityLabel="Stock quantity"
        style={styles.input}
        keyboardType="number-pad"
        value={String(current)}
        onChangeText={(text) => set(Number.parseInt(text.replace(/\D/g, "") || "0", 10))}
        selectTextOnFocus
      />
      <Pressable accessibilityLabel="One more" onPress={() => set(current + 1)} style={styles.step}>
        <Text style={styles.stepText}>+</Text>
      </Pressable>
      {dirty ? (
        <Pressable
          accessibilityRole="button"
          disabled={saving}
          onPress={() => onSave(current)}
          style={styles.save}
        >
          {saving ? <ActivityIndicator color={colors.brandText} /> : <Text style={styles.saveText}>Save</Text>}
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
  step: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
  },
  stepText: { color: colors.text, fontSize: 20, fontWeight: "600" },
  input: {
    minWidth: 52,
    height: 36,
    textAlign: "center",
    color: colors.text,
    fontSize: 16,
    fontWeight: "700",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
  },
  save: { backgroundColor: colors.brand, borderRadius: 999, paddingHorizontal: 14, height: 36, justifyContent: "center" },
  saveText: { color: colors.brandText, fontWeight: "700" },
});
