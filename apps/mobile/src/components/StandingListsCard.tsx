import { Pressable, StyleSheet, Text, View } from "react-native";
import type { MobileStandingList } from "@contracts/mobile/communication";
import { composeMessage } from "@/lib/navigation";
import { colors, spacing } from "@/lib/theme";
import Card from "@/components/Card";

/** Auto-updating lists with a Broadcast shortcut into the composer. */
export default function StandingListsCard({
  lists,
}: {
  lists: MobileStandingList[];
}) {
  if (lists.length === 0) return null;
  return (
    <Card title="Standing lists">
      <Text style={styles.meta}>
        Auto-updating groups — broadcast when you restock or have news.
      </Text>
      {lists.map((list) => (
        <View key={list.id} style={styles.row}>
          <View style={styles.body}>
            <Text style={styles.name}>{list.name}</Text>
            <Text style={styles.meta}>
              {list.description ? `${list.description} · ` : ""}
              {list.count} contacts
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            onPress={() => composeMessage({ listId: list.id })}
            hitSlop={8}
          >
            <Text style={styles.link}>Broadcast</Text>
          </Pressable>
        </View>
      ))}
    </Card>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  body: { flex: 1, gap: 2 },
  name: { color: colors.text, fontSize: 15, fontWeight: "600" },
  meta: { color: colors.muted, fontSize: 13 },
  link: { color: colors.brand, fontWeight: "700" },
});
