import { ActivityIndicator, Alert, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";
import { Stack } from "expo-router";
import type { MobileNotification } from "@contracts/mobile/notifications";
import { useToken } from "@/auth/useAuth";
import {
  useCloseAllNotifications,
  useDeleteNotification,
  useNotifications,
  useSetNotificationStatus,
} from "@/data/useNotifications";
import { notificationMenu } from "@/lib/notification-menu";
import { openOnWeb } from "@/lib/open-web";
import { colors, spacing } from "@/lib/theme";
import AlertSettingsCard from "@/components/AlertSettingsCard";
import NotificationRow from "@/components/NotificationRow";
import ErrorMessage from "@/components/ErrorMessage";

export default function NotificationsScreen() {
  const token = useToken();
  const notifications = useNotifications();
  const setStatus = useSetNotificationStatus();
  const remove = useDeleteNotification();
  const closeAll = useCloseAllNotifications();
  const failed = (error: Error) => Alert.alert("Couldn't update", error.message);
  const openCount = notifications.data?.openCount ?? 0;

  function showMenu(notification: MobileNotification) {
    Alert.alert(
      notification.title,
      notification.message,
      notificationMenu(notification, {
        setStatus: (status) => setStatus.mutate({ id: notification.id, status }, { onError: failed }),
        remove: () => remove.mutate(notification.id, { onError: failed }),
        openWeb: (path) => void openOnWeb(path, token),
      }),
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerRight: () =>
            openCount > 0 ? (
              <Pressable
                accessibilityRole="button"
                disabled={closeAll.isPending}
                onPress={() => closeAll.mutate(undefined, { onError: failed })}
              >
                <Text style={styles.headerAction}>Close all</Text>
              </Pressable>
            ) : null,
        }}
      />
      <FlatList
        style={styles.list}
        contentContainerStyle={styles.content}
        data={notifications.data?.notifications ?? []}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <NotificationRow notification={item} onPress={showMenu} />}
        ListHeaderComponent={
          <View style={styles.header}>
            <AlertSettingsCard />
            {openCount > 0 ? (
              <Text style={styles.count}>
                {openCount} open notification{openCount === 1 ? "" : "s"}
              </Text>
            ) : null}
            <ErrorMessage error={notifications.error} />
          </View>
        }
        ListEmptyComponent={
          notifications.isPending ? (
            <ActivityIndicator color={colors.brand} style={styles.loading} />
          ) : (
            <Text style={styles.empty}>No notifications yet.</Text>
          )
        }
        refreshControl={
          <RefreshControl
            refreshing={notifications.isRefetching}
            onRefresh={() => void notifications.refetch()}
            tintColor={colors.brand}
          />
        }
      />
    </>
  );
}

const styles = StyleSheet.create({
  list: { backgroundColor: colors.background },
  content: { padding: spacing.md, gap: spacing.sm, paddingBottom: spacing.lg * 2 },
  header: { gap: spacing.sm, marginBottom: spacing.xs },
  headerAction: { color: colors.brand, fontWeight: "600", fontSize: 16 },
  count: { color: colors.muted, fontSize: 14 },
  loading: { marginTop: spacing.lg },
  empty: { color: colors.muted, textAlign: "center", marginTop: spacing.lg },
});
