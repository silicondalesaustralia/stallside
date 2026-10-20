import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useCommunication } from "@/data/useCommunication";
import { composeMessage, openCampaign } from "@/lib/navigation";
import { colors, spacing } from "@/lib/theme";
import CampaignRow from "@/components/CampaignRow";
import StandingListsCard from "@/components/StandingListsCard";
import ErrorMessage from "@/components/ErrorMessage";
import PrimaryButton from "@/components/PrimaryButton";

export default function CommunicationScreen() {
  const communication = useCommunication();
  const data = communication.data;

  return (
    <FlatList
      style={styles.list}
      contentContainerStyle={styles.content}
      data={data?.campaigns ?? []}
      keyExtractor={(campaign) => campaign.id}
      renderItem={({ item }) => (
        <CampaignRow campaign={item} onPress={openCampaign} />
      )}
      ListHeaderComponent={
        <View style={styles.header}>
          <PrimaryButton label="New message" onPress={() => composeMessage()} />
          <Text style={styles.hint}>
            Email opted-in contacts, saved lists, product buyers, or one
            customer.
          </Text>
          <ErrorMessage error={communication.error} />
          {data ? <StandingListsCard lists={data.standingLists} /> : null}
          {data?.campaigns.length ? (
            <Text style={styles.section}>Messages</Text>
          ) : null}
        </View>
      }
      ListEmptyComponent={
        communication.isPending ? (
          <ActivityIndicator color={colors.brand} style={styles.loading} />
        ) : (
          <Text style={styles.empty}>No messages yet.</Text>
        )
      }
      refreshControl={
        <RefreshControl
          refreshing={communication.isRefetching}
          onRefresh={() => void communication.refetch()}
          tintColor={colors.brand}
        />
      }
    />
  );
}

const styles = StyleSheet.create({
  list: { backgroundColor: colors.background },
  content: {
    padding: spacing.md,
    gap: spacing.sm,
    paddingBottom: spacing.lg * 2,
  },
  header: { gap: spacing.sm, marginBottom: spacing.xs },
  hint: { color: colors.muted, fontSize: 13, textAlign: "center" },
  section: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700",
    marginTop: spacing.sm,
  },
  loading: { marginTop: spacing.lg },
  empty: { color: colors.muted, textAlign: "center", marginTop: spacing.md },
});
