import { StyleSheet, Text, View } from "react-native";
import type { MobileCalendarEvent } from "@contracts/mobile/calendar";
import { colors, spacing } from "@/lib/theme";
import CalendarEventRow from "@/components/CalendarEventRow";

type Props = {
  label: string;
  isToday: boolean;
  events: MobileCalendarEvent[];
  onPressEvent: (event: MobileCalendarEvent) => void;
};

export default function CalendarDay({
  label,
  isToday,
  events,
  onPressEvent,
}: Props) {
  return (
    <View style={styles.day}>
      <Text style={[styles.label, isToday && styles.today]}>
        {isToday ? `Today · ${label}` : label}
      </Text>
      {events.length === 0 ? (
        <Text style={styles.empty}>Nothing on</Text>
      ) : (
        events.map((event) => (
          <CalendarEventRow
            key={event.id}
            event={event}
            onPress={onPressEvent}
          />
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  day: { gap: spacing.xs + 2 },
  label: { color: colors.text, fontSize: 14, fontWeight: "700" },
  today: { color: colors.brand },
  empty: { color: colors.placeholder, fontSize: 13 },
});
