import { useState } from "react";
import { Alert, StyleSheet, TextInput } from "react-native";
import { useSaveCustomerNotes } from "@/data/useCustomers";
import { colors, spacing } from "@/lib/theme";
import Card from "@/components/Card";
import PrimaryButton from "@/components/PrimaryButton";

export default function CustomerNotesCard({ customerId, notes }: { customerId: string; notes: string | null }) {
  const [draft, setDraft] = useState(notes ?? "");
  const save = useSaveCustomerNotes(customerId);
  const dirty = draft !== (notes ?? "");

  return (
    <Card title="Notes">
      <TextInput
        style={styles.input}
        value={draft}
        onChangeText={setDraft}
        multiline
        maxLength={4000}
        placeholder="Private notes, only you see these"
        textAlignVertical="top"
      />
      {dirty ? (
        <PrimaryButton
          label="Save notes"
          loading={save.isPending}
          onPress={() =>
            save.mutate(draft, { onError: (error) => Alert.alert("Couldn't save notes", error.message) })
          }
        />
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  input: {
    minHeight: 96,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: spacing.sm,
    fontSize: 15,
    color: colors.text,
    backgroundColor: colors.background,
  },
});
