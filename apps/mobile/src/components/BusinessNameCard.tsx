import { useState } from "react";
import { Alert, StyleSheet, Text } from "react-native";
import type { AccountResponse } from "@contracts/mobile/account";
import { useUpdateBusinessName } from "@/data/useAccount";
import { colors } from "@/lib/theme";
import Card from "@/components/Card";
import FormField from "@/components/FormField";
import PrimaryButton from "@/components/PrimaryButton";

type Props = { account: AccountResponse };

export default function BusinessNameCard({ account }: Props) {
  const [name, setName] = useState(account.businessName);
  const update = useUpdateBusinessName();
  const changed = name.trim() !== account.businessName;

  function submit() {
    update.mutate(name, {
      onSuccess: () => Alert.alert("Saved", "Business name updated."),
      onError: (error) => Alert.alert("Couldn't save", error.message),
    });
  }

  return (
    <Card title="Account">
      <Text style={styles.meta}>Signed in as {account.email}</Text>
      <FormField
        label="Business name"
        value={name}
        onChangeText={setName}
        hint="Your account name. Each business keeps its own name."
      />
      <PrimaryButton
        label="Save name"
        loading={update.isPending}
        disabled={!changed}
        onPress={submit}
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  meta: { color: colors.muted, fontSize: 13 },
});
