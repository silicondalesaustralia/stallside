import { useState } from "react";
import { Alert, StyleSheet, Text } from "react-native";
import type { BusinessDetailsResponse } from "@contracts/mobile/business";
import { useSaveBusinessDetails } from "@/data/useBusinessDetails";
import { colors } from "@/lib/theme";
import Card from "@/components/Card";
import FormField from "@/components/FormField";
import PickerField from "@/components/PickerField";
import PrimaryButton from "@/components/PrimaryButton";

/** Same fields as the web business Details form. */
export default function BusinessDetailsForm({
  data,
}: {
  data: BusinessDetailsResponse;
}) {
  const save = useSaveBusinessDetails();
  const [name, setName] = useState(data.name);
  const [locationLabel, setLocationLabel] = useState(data.locationLabel);
  const [currency, setCurrency] = useState(data.currency);
  const [timezone, setTimezone] = useState(data.timezone);

  function submit() {
    if (name.trim().length < 2) {
      Alert.alert("Check the name", "Business name needs 2 or more letters.");
      return;
    }
    save.mutate(
      { standId: data.id, name, locationLabel, currency, timezone },
      {
        onSuccess: () => Alert.alert("Saved", "Business details saved."),
        onError: (error) => Alert.alert("Couldn't save", error.message),
      },
    );
  }

  return (
    <Card title="Details">
      <FormField label="Business name" value={name} onChangeText={setName} />
      <FormField
        label="Suburb / location"
        value={locationLabel}
        onChangeText={setLocationLabel}
      />
      <PickerField
        label="Currency"
        options={data.currencies}
        selected={[currency]}
        multiple={false}
        placeholder="Choose a currency"
        onChange={(ids) => ids[0] && setCurrency(ids[0])}
      />
      <PickerField
        label="Timezone"
        options={data.timezones}
        selected={[timezone]}
        multiple={false}
        placeholder="Choose a timezone"
        onChange={(ids) => ids[0] && setTimezone(ids[0])}
      />
      <Text style={styles.hint}>
        Pre-order order-by and collection times use this timezone. PayID only
        appears for AUD under Checkout.
      </Text>
      <PrimaryButton
        label="Save details"
        loading={save.isPending}
        onPress={submit}
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  hint: { color: colors.muted, fontSize: 12 },
});
