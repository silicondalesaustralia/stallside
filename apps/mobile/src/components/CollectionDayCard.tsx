import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { CollectionDay } from "@contracts/mobile/collections";
import { formatCents } from "@/lib/format";
import { emailPickupGroup } from "@/lib/navigation";
import { colors, spacing } from "@/lib/theme";
import Card from "@/components/Card";
import CollectionOrderRow from "@/components/CollectionOrderRow";

type Props = {
  day: CollectionDay;
  pendingId: string | undefined;
  onAdvance: (orderId: string) => void;
};

export default function CollectionDayCard({
  day,
  pendingId,
  onAdvance,
}: Props) {
  const [showList, setShowList] = useState(false);
  const left = day.orders.filter(
    (order) => order.status !== "COLLECTED",
  ).length;

  return (
    <Card title={day.title}>
      {day.label !== day.title ? (
        <Text style={styles.when}>{day.label}</Text>
      ) : null}
      <Text style={styles.meta}>
        {day.orders.length} order{day.orders.length === 1 ? "" : "s"} ·{" "}
        {day.itemCount} items · {formatCents(day.takenCents, day.currency)}{" "}
        taken · {left} to go
        {day.windowClosed ? " · date passed" : ""}
      </Text>
      {day.deliveries.length > 0 ? (
        <Text style={styles.meta}>
          Deliveries:{" "}
          {day.deliveries.map((d) => `${d.count} in ${d.name}`).join(", ")}
        </Text>
      ) : null}
      <View style={styles.actions}>
        <Pressable
          accessibilityRole="button"
          onPress={() => setShowList((open) => !open)}
        >
          <Text style={styles.toggle}>
            {showList ? "Hide what to make" : "What to make"}
          </Text>
        </Pressable>
        {day.emailableCount > 0 ? (
          <Pressable
            accessibilityRole="button"
            onPress={() => emailPickupGroup(day.key, day.title)}
          >
            <Text style={styles.toggle}>
              Email customers ({day.emailableCount})
            </Text>
          </Pressable>
        ) : null}
      </View>
      {showList ? (
        <View style={styles.list}>
          {day.makeList.map((line) => (
            <View key={line.name} style={styles.line}>
              <Text style={styles.lineName}>{line.name}</Text>
              <Text style={styles.lineQty}>{line.qty}</Text>
            </View>
          ))}
        </View>
      ) : null}
      {day.orders.map((order) => (
        <CollectionOrderRow
          key={order.id}
          order={order}
          pending={pendingId === order.id}
          onAdvance={onAdvance}
        />
      ))}
    </Card>
  );
}

const styles = StyleSheet.create({
  when: { color: colors.text, fontSize: 14, fontWeight: "600" },
  meta: { color: colors.muted, fontSize: 13 },
  actions: { flexDirection: "row", flexWrap: "wrap", gap: spacing.md },
  toggle: { color: colors.brand, fontWeight: "700", fontSize: 14 },
  list: {
    backgroundColor: colors.background,
    borderRadius: 10,
    padding: spacing.sm,
    gap: 2,
  },
  line: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  lineName: { color: colors.text, fontSize: 14, flexShrink: 1 },
  lineQty: { color: colors.text, fontSize: 14, fontWeight: "700" },
});
