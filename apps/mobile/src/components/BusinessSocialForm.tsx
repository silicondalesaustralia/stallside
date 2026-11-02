import { useState } from "react";
import { Alert, StyleSheet, Text } from "react-native";
import type {
  BusinessDetailsResponse,
  SocialLinkField,
} from "@contracts/mobile/business";
import { useSaveBusinessSocial } from "@/data/useBusinessDetails";
import { colors } from "@/lib/theme";
import Card from "@/components/Card";
import FormField from "@/components/FormField";
import PrimaryButton from "@/components/PrimaryButton";

/** Social links shown as icons on the website and checkout pages. */
export default function BusinessSocialForm({
  data,
}: {
  data: BusinessDetailsResponse;
}) {
  const save = useSaveBusinessSocial();
  const [links, setLinks] = useState(data.social);

  function setLink(field: SocialLinkField, value: string) {
    setLinks((current) => ({ ...current, [field]: value }));
  }

  function submit() {
    save.mutate(
      { standId: data.id, ...links },
      {
        onSuccess: () => Alert.alert("Saved", "Social links saved."),
        onError: (error) => Alert.alert("Couldn't save", error.message),
      },
    );
  }

  return (
    <Card title="Social links">
      <Text style={styles.hint}>
        Paste profile or website URLs. They show as icons on your website and
        checkout pages. Leave blank to hide an icon.
      </Text>
      {data.socialLabels.map(({ field, label }) => (
        <FormField
          key={field}
          label={label}
          value={links[field]}
          onChangeText={(value) => setLink(field, value)}
          placeholder="https://"
          keyboardType="url"
          autoCapitalize="none"
        />
      ))}
      <PrimaryButton
        label="Save social links"
        loading={save.isPending}
        onPress={submit}
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  hint: { color: colors.muted, fontSize: 13 },
});
