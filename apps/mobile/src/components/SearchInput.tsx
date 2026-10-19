import { StyleSheet, TextInput } from "react-native";
import { colors, spacing } from "@/lib/theme";

type Props = {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
};

export default function SearchInput({ value, onChange, placeholder }: Props) {
  return (
    <TextInput
      style={styles.input}
      placeholder={placeholder}
      value={value}
      onChangeText={onChange}
      autoCorrect={false}
      autoCapitalize="none"
      returnKeyType="search"
      accessibilityLabel={placeholder}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    fontSize: 16,
    color: colors.text,
  },
});
