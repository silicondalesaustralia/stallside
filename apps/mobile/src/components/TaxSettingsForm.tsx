import { useState } from "react";
import { Alert, StyleSheet, Text } from "react-native";
import type { TaxSettingsResponse } from "@contracts/mobile/tax";
import { useSaveTaxSettings } from "@/data/useTaxSettings";
import { colors } from "@/lib/theme";
import Card from "@/components/Card";
import FormField from "@/components/FormField";
import PickerField from "@/components/PickerField";
import PrimaryButton from "@/components/PrimaryButton";
import SwitchRow from "@/components/SwitchRow";

/** Same fields and rules as the web Tax settings form. */
export default function TaxSettingsForm({
  data,
}: {
  data: TaxSettingsResponse;
}) {
  const save = useSaveTaxSettings();
  const [country, setCountry] = useState(data.country);
  const [rate, setRate] = useState(data.rate);
  const [taxId, setTaxId] = useState(data.taxId);
  const [registered, setRegistered] = useState(data.registered);
  const [taxShipping, setTaxShipping] = useState(data.taxShipping);
  const region =
    data.regions.find((r) => r.country === country) ?? data.regions[0];
  const name = region?.name ?? "Tax";
  const inclusive = region?.inclusive ?? true;

  function pickCountry(next: string) {
    setCountry(next);
    setRate(next === data.country ? data.rate : "");
  }

  function submit() {
    save.mutate(
      { country, rate, taxId, registered, taxShipping },
      {
        onSuccess: () => Alert.alert("Saved", "Tax settings saved."),
        onError: (error) => Alert.alert("Couldn't save", error.message),
      },
    );
  }

  return (
    <Card title={`${name} settings`}>
      <Text style={styles.status}>{data.status}</Text>
      <PickerField
        label="Country"
        options={data.regions.map((r) => ({
          id: r.country,
          label: `${r.label} (${r.name})`,
        }))}
        selected={[country]}
        multiple={false}
        placeholder="Choose a country"
        onChange={(ids) => ids[0] && pickCountry(ids[0])}
      />
      <FormField
        label={`${name} rate (%)`}
        value={rate}
        onChangeText={setRate}
        keyboardType="decimal-pad"
        placeholder={region?.defaultRate ?? "e.g. 8.25"}
      />
      <FormField
        label={region?.idLabel ?? "Tax ID"}
        value={taxId}
        onChangeText={setTaxId}
        autoCapitalize="characters"
      />
      <SwitchRow
        label={`Registered for ${name}`}
        hint={
          inclusive
            ? `My prices include ${name}`
            : `Add ${name.toLowerCase()} at checkout`
        }
        value={registered}
        onChange={setRegistered}
      />
      <SwitchRow
        label={
          inclusive
            ? `My delivery fees include ${name}`
            : `Charge ${name.toLowerCase()} on delivery fees`
        }
        value={taxShipping}
        onChange={setTaxShipping}
      />
      <Text style={styles.hint}>
        {inclusive
          ? `Vendl works out the ${name} inside each sale for your reports. Shoppers pay the shelf price.`
          : `Shoppers see ${name.toLowerCase()} added to their cart total. Use your combined state/local or provincial rate, and mark exempt products on each product.`}
      </Text>
      <PrimaryButton label="Save" loading={save.isPending} onPress={submit} />
    </Card>
  );
}

const styles = StyleSheet.create({
  status: { color: colors.text, fontSize: 14, fontWeight: "600" },
  hint: { color: colors.muted, fontSize: 12 },
});
