import { useState } from "react";
import { Alert, StyleSheet, Text } from "react-native";
import { useInviteSupplier } from "@/data/useSuppliers";
import { colors } from "@/lib/theme";
import Card from "@/components/Card";
import FormField from "@/components/FormField";
import PrimaryButton from "@/components/PrimaryButton";

type Props = { standId: string };

/** Emails a supplier a link to add their own stock to this business. */
export default function InviteSupplierCard({ standId }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const invite = useInviteSupplier(standId);

  function submit() {
    invite.mutate(
      { name: name.trim(), email: email.trim() },
      {
        onSuccess: () => {
          setName("");
          setEmail("");
          Alert.alert("Invite sent", "They'll get an email with a link.");
        },
        onError: (error) => Alert.alert("Couldn't invite", error.message),
      },
    );
  }

  return (
    <Card title="Invite a supplier">
      <Text style={styles.hint}>
        Suppliers add their own stock. You set the price and what you owe them
        per sale.
      </Text>
      <FormField label="Name" value={name} onChangeText={setName} />
      <FormField
        label="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <PrimaryButton
        label="Send invite"
        loading={invite.isPending}
        disabled={!name.trim() || !email.trim()}
        onPress={submit}
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  hint: { color: colors.muted, fontSize: 13 },
});
