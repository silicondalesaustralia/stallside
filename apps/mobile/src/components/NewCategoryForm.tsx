import { useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { useCreateCategory } from "@/data/useCategories";
import { openCategory } from "@/lib/navigation";
import { spacing } from "@/lib/theme";
import FormField from "@/components/FormField";
import PrimaryButton from "@/components/PrimaryButton";

/** Name a category and open it to pick products, like the web "New category" box. */
export default function NewCategoryForm() {
  const [title, setTitle] = useState("");
  const create = useCreateCategory();

  function submit() {
    create.mutate(title.trim(), {
      onSuccess: ({ id }) => {
        setTitle("");
        openCategory(id);
      },
      onError: (error) => Alert.alert("Couldn't add category", error.message),
    });
  }

  return (
    <View style={styles.wrap}>
      <FormField
        label="New category"
        value={title}
        onChangeText={setTitle}
        placeholder="e.g. Vegetables"
      />
      <PrimaryButton
        label="Add category"
        loading={create.isPending}
        disabled={!title.trim()}
        onPress={submit}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.sm },
});
