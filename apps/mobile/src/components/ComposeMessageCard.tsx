import { StyleSheet, Text, View } from "react-native";
import type { CommunicationInput } from "@contracts/mobile/communication";
import { colors, spacing } from "@/lib/theme";
import Card from "@/components/Card";
import FormField from "@/components/FormField";

type Props = {
  values: CommunicationInput;
  set: (patch: Partial<CommunicationInput>) => void;
};

/** Subject, heading, message and optional button. */
export default function ComposeMessageCard({ values, set }: Props) {
  return (
    <Card title="Message">
      <View style={styles.stack}>
        <FormField
          label="Subject"
          value={values.subject}
          onChangeText={(subject) => set({ subject })}
        />
        <FormField
          label="Heading (optional)"
          value={values.heading}
          onChangeText={(heading) => set({ heading })}
        />
        <FormField
          label="Message"
          value={values.body}
          onChangeText={(body) => set({ body })}
          multiline
          hint="Leave a blank line between paragraphs. For bold text or links, write it on the web."
        />
        <View style={styles.row}>
          <FormField
            label="Button label"
            value={values.ctaLabel}
            onChangeText={(ctaLabel) => set({ ctaLabel })}
            placeholder="Shop now"
          />
          <FormField
            label="Button link"
            value={values.ctaUrl}
            onChangeText={(ctaUrl) => set({ ctaUrl })}
            placeholder="https://"
            autoCapitalize="none"
            keyboardType="url"
          />
        </View>
        <Text style={styles.hint}>
          Leave both button fields blank for no button.
        </Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  stack: { gap: spacing.md },
  row: { flexDirection: "row", gap: spacing.sm },
  hint: { color: colors.muted, fontSize: 12 },
});
