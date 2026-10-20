import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
} from "react-native";
import { useBusiness } from "@/business/useBusiness";
import { useShipping } from "@/data/useShipping";
import { colors, spacing } from "@/lib/theme";
import ShippingForm from "@/components/ShippingForm";
import ErrorMessage from "@/components/ErrorMessage";

export default function ShippingScreen() {
  const { selected } = useBusiness();
  const shipping = useShipping(selected?.id ?? null);

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <ErrorMessage error={shipping.error} />
        {shipping.isPending && selected ? (
          <ActivityIndicator color={colors.brand} style={styles.loading} />
        ) : null}
        {selected && shipping.data ? (
          <ShippingForm
            key={selected.id}
            standId={selected.id}
            data={shipping.data}
          />
        ) : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  screen: { backgroundColor: colors.background },
  content: { padding: spacing.md, paddingBottom: spacing.lg * 2 },
  loading: { marginTop: spacing.lg },
});
