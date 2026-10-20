import { useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { CALENDAR_CATEGORIES } from "@contracts/mobile/calendar";
import { useToken } from "@/auth/useAuth";
import { useCalendarWeek } from "@/data/useCalendar";
import {
  CATEGORY_LABEL,
  openCalendarEvent,
  type CalendarFilter,
} from "@/lib/calendar-labels";
import { colors, spacing } from "@/lib/theme";
import CalendarWeekHeader from "@/components/CalendarWeekHeader";
import CalendarDay from "@/components/CalendarDay";
import ChipRow from "@/components/ChipRow";
import ErrorMessage from "@/components/ErrorMessage";

/** Week agenda of cut-offs, pickups, deliveries, markets and the owner's own calendar. */
export default function CalendarScreen() {
  const token = useToken();
  const params = useLocalSearchParams<{ date?: string }>();
  const [date, setDate] = useState<string | null>(
    params.date && /^\d{4}-\d{2}-\d{2}$/.test(params.date) ? params.date : null,
  );
  const [filter, setFilter] = useState<CalendarFilter>("all");
  const week = useCalendarWeek(date);
  const data = week.data;

  const present = new Set(
    data?.days.flatMap((day) => day.events.map((e) => e.category)) ?? [],
  );
  const filters = [
    { value: "all" as const, label: "All" },
    ...CALENDAR_CATEGORIES.filter((c) => present.has(c)).map((c) => ({
      value: c,
      label: CATEGORY_LABEL[c],
    })),
  ];
  const active = filters.some((f) => f.value === filter) ? filter : "all";
  const isThisWeek =
    !data || (data.weekStart <= data.today && data.today < data.nextWeek);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={week.isRefetching && !week.isPlaceholderData}
          onRefresh={() => void week.refetch()}
          tintColor={colors.brand}
        />
      }
    >
      <CalendarWeekHeader
        heading={data?.heading ?? "This week"}
        isThisWeek={isThisWeek}
        onPrevious={() => data && setDate(data.previousWeek)}
        onNext={() => data && setDate(data.nextWeek)}
        onToday={() => setDate(null)}
      />
      {filters.length > 1 ? (
        <ChipRow options={filters} value={active} onChange={setFilter} />
      ) : null}
      <ErrorMessage error={week.error} />
      {week.isPending || week.isPlaceholderData ? (
        <ActivityIndicator color={colors.brand} />
      ) : null}
      {data?.days.map((day) => (
        <CalendarDay
          key={day.dayKey}
          label={day.label}
          isToday={day.dayKey === data.today}
          events={day.events.filter(
            (e) => active === "all" || e.category === active,
          )}
          onPressEvent={(event) => openCalendarEvent(event, token)}
        />
      ))}
      <Text style={styles.hint}>
        To move something to another day, drag it on the web calendar. Times are
        in {data?.timeZone ?? "your business's timezone"}.
      </Text>
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
  hint: { color: colors.muted, fontSize: 13, textAlign: "center" },
});
