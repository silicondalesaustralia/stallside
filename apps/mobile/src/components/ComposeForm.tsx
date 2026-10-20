import { useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import type {
  CommunicationInput,
  ComposeOptionsResponse,
} from "@contracts/mobile/communication";
import {
  useAudienceCount,
  useListMembers,
  useSendCommunication,
} from "@/data/useCommunication";
import { textToHtml } from "@/lib/communication-labels";
import { spacing } from "@/lib/theme";
import ComposeAudienceCard from "@/components/ComposeAudienceCard";
import ComposeMessageCard from "@/components/ComposeMessageCard";
import PrimaryButton from "@/components/PrimaryButton";

type Props = { options: ComposeOptionsResponse; initial: CommunicationInput };

/** Write and send an email; asks "Send to N people?" before anything goes out. */
export default function ComposeForm({ options, initial }: Props) {
  const [values, setValues] = useState(initial);
  const [listPicks, setListPicks] = useState<string[] | null>(null);
  const members = useListMembers(
    values.audienceType === "list" ? values.listId : null,
  );
  const count = useAudienceCount();
  const send = useSendCommunication();

  function set(patch: Partial<CommunicationInput>) {
    if ("listId" in patch) setListPicks(null);
    setValues((current) => ({ ...current, ...patch }));
  }

  function buildInput(): CommunicationInput {
    const recipientEmails =
      values.audienceType === "list"
        ? (listPicks ?? members.data?.emails ?? [])
        : [];
    return { ...values, body: textToHtml(values.body), recipientEmails };
  }

  function sendNow(input: CommunicationInput) {
    send.mutate(input, {
      onSuccess: ({ id }) =>
        router.replace({
          pathname: "/communication/[campaignId]",
          params: { campaignId: id },
        }),
      onError: (error) => Alert.alert("Couldn't send", error.message),
    });
  }

  async function confirmAndSend() {
    const input = buildInput();
    try {
      const { count: people } = await count.mutateAsync(input);
      if (people === 0) {
        Alert.alert(
          "No one to send to",
          "No matching recipients (or they unsubscribed).",
        );
        return;
      }
      Alert.alert(
        `Send to ${people} ${people === 1 ? "person" : "people"}?`,
        `“${input.subject.trim()}”`,
        [
          { text: "Cancel", style: "cancel" },
          { text: "Send", onPress: () => sendNow(input) },
        ],
      );
    } catch (error) {
      Alert.alert(
        "Couldn't check recipients",
        error instanceof Error ? error.message : "Try again.",
      );
    }
  }

  return (
    <View style={styles.wrap}>
      <ComposeAudienceCard
        values={values}
        set={set}
        options={options}
        listEmails={members.data?.emails ?? null}
        listPicks={listPicks}
        onListPicks={setListPicks}
      />
      <ComposeMessageCard values={values} set={set} />
      <PrimaryButton
        label="Send"
        loading={count.isPending || send.isPending}
        disabled={!values.subject.trim() || !values.body.trim()}
        onPress={() => void confirmAndSend()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.md },
});
