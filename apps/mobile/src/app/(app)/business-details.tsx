import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
} from "react-native";
import { useBusiness } from "@/business/useBusiness";
import { useBusinessDetails } from "@/data/useBusinessDetails";
import { colors, spacing } from "@/lib/theme";
import BusinessDetailsForm from "@/components/BusinessDetailsForm";
import BusinessLinksCard from "@/components/BusinessLinksCard";
import BusinessSocialForm from "@/components/BusinessSocialForm";
import ErrorMessage from "@/components/ErrorMessage";

export default function BusinessDetailsScreen() {
  const { selected } = useBusiness();
  const details = useBusinessDetails(selected?.id ?? null);
  const data = details.data;
  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      refreshControl={
        <RefreshControl
          refreshing={details.isRefetching}
          onRefresh={() => void details.refetch()}
          tintColor={colors.brand}
        />
      }
    >
      {selected ? null : (
        <Text style={styles.muted}>Choose a business first.</Text>
      )}
      <ErrorMessage error={details.error} />
      {details.isLoading ? <ActivityIndicator color={colors.brand} /> : null}
      {data ? (
        <>
          <BusinessDetailsForm
            key={`${data.id}:${data.currency}`}
            data={data}
          />
          <BusinessLinksCard data={data} />
          <BusinessSocialForm key={`social:${data.id}`} data={data} />
        </>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: colors.background },
  content: {
    padding: spacing.md,
    gap: spacing.md,
    paddingBottom: spacing.lg * 2,
  },
  muted: { color: colors.muted, fontSize: 14 },
});
