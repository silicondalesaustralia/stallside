import { useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import type {
  MobileCategory,
  UpdateCategoryBody,
} from "@contracts/mobile/categories";
import { useUpdateCategory } from "@/data/useCategories";
import { spacing } from "@/lib/theme";
import Card from "@/components/Card";
import FormField from "@/components/FormField";
import PrimaryButton from "@/components/PrimaryButton";
import SwitchRow from "@/components/SwitchRow";

/** Name, published and shop-menu switches; description and image stay on the web. */
export default function CategorySettingsCard({
  category,
}: {
  category: MobileCategory;
}) {
  const [title, setTitle] = useState(category.title);
  const update = useUpdateCategory(category.id);
  const save = (body: UpdateCategoryBody) =>
    update.mutate(body, {
      onError: (error) => Alert.alert("Couldn't save category", error.message),
    });
  const renamed = title.trim() !== category.title;

  return (
    <Card title="Category">
      <View style={styles.stack}>
        <SwitchRow
          label="Published"
          hint={
            category.isActive
              ? "Shown in your shop, on your website and in QR codes."
              : "Hidden everywhere. Its products are kept."
          }
          value={category.isActive}
          onChange={(isActive) => save({ isActive })}
        />
        <SwitchRow
          label="Show in shop menu"
          value={category.showOnWebsite}
          onChange={(showOnWebsite) => save({ showOnWebsite })}
        />
        <FormField label="Name" value={title} onChangeText={setTitle} />
        {renamed ? (
          <PrimaryButton
            label="Save name"
            loading={update.isPending}
            disabled={!title.trim()}
            onPress={() => save({ title: title.trim() })}
          />
        ) : null}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  stack: { gap: spacing.md },
});
