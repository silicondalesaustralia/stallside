import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, spacing } from "@/lib/theme";
import RoundIconButton from "@/components/RoundIconButton";

type Props = {
  heading: string;
  isThisWeek: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onToday: () => void;
};

export default function CalendarWeekHeader(props: Props) {
  return (
    <View style={styles.row}>
      <RoundIconButton
        label="‹"
        accessibilityLabel="Previous week"
        onPress={props.onPrevious}
      />
      <View style={styles.middle}>
        <Text style={styles.heading}>{props.heading}</Text>
        {props.isThisWeek ? null : (
          <Pressable accessibilityRole="button" onPress={props.onToday}>
            <Text style={styles.today}>Back to this week</Text>
          </Pressable>
        )}
      </View>
      <RoundIconButton
        label="›"
        accessibilityLabel="Next week"
        onPress={props.onNext}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  middle: { flex: 1, alignItems: "center", gap: 2 },
  heading: { color: colors.text, fontSize: 17, fontWeight: "700" },
  today: { color: colors.brand, fontSize: 13, fontWeight: "600" },
});
