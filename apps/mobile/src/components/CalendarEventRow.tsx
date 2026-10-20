import { Pressable, StyleSheet, Text, View } from "react-native";
import type { MobileCalendarEvent } from "@contracts/mobile/calendar";
import { CATEGORY_COLOR } from "@/lib/calendar-labels";
import { colors, spacing } from "@/lib/theme";

type Props = {
  event: MobileCalendarEvent;
  onPress: (event: MobileCalendarEvent) => void;
};

export default function CalendarEventRow({ event, onPress }: Props) {
  const typeLabel = event.title.startsWith(event.typeLabel)
    ? null
    : event.typeLabel;
  const details = [typeLabel, event.location, event.summary]
    .filter(Boolean)
    .join(" · ");
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => onPress(event)}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <View
        style={[
          styles.bar,
          { backgroundColor: CATEGORY_COLOR[event.category] },
        ]}
      />
      <View style={styles.body}>
        <Text style={styles.time}>{event.timeLabel}</Text>
        <Text style={styles.title}>{event.title}</Text>
        {details ? (
          <Text style={styles.meta} numberOfLines={2}>
            {details}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: spacing.sm,
    padding: spacing.sm + 4,
    borderRadius: 14,
    backgroundColor: colors.surface,
  },
  pressed: { opacity: 0.7 },
  bar: { width: 4, borderRadius: 2 },
  body: { flex: 1, gap: 2 },
  time: { color: colors.muted, fontSize: 12, fontWeight: "600" },
  title: { color: colors.text, fontSize: 15, fontWeight: "700" },
  meta: { color: colors.muted, fontSize: 13 },
});
