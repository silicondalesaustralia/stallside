import { useState } from "react";
import { Alert } from "react-native";
import type { RecipeDetailResponse } from "@contracts/mobile/recipes";
import { useSaveRecipe } from "@/data/useRecipeMutations";
import { centsToInput, inputToCents } from "@/lib/money-input";
import { parseQuantity } from "@/lib/recipe-format";
import Card from "@/components/Card";
import FormField from "@/components/FormField";
import PrimaryButton from "@/components/PrimaryButton";

/** Same fields as the web "Recipe settings" card. */
export default function RecipeSettingsForm({
  data,
}: {
  data: RecipeDetailResponse;
}) {
  const recipe = data.recipe;
  const save = useSaveRecipe(recipe.id);
  const [name, setName] = useState(recipe.name);
  const [yieldText, setYieldText] = useState(String(recipe.yieldQuantity));
  const [yieldLabel, setYieldLabel] = useState(recipe.yieldLabel);
  const [waste, setWaste] = useState(String(recipe.wastePercent));
  const [minutes, setMinutes] = useState(String(recipe.labourMinutes));
  const [rate, setRate] = useState(centsToInput(recipe.labourRateCents));
  const [overhead, setOverhead] = useState(centsToInput(recipe.overheadCents));
  const [notes, setNotes] = useState(recipe.instructions ?? "");

  function submit() {
    const yieldQuantity = parseQuantity(yieldText);
    const wastePercent = parseQuantity(waste) ?? 0;
    const labourMinutes = parseQuantity(minutes) ?? 0;
    if (!name.trim()) return Alert.alert("Add a name", "Enter a recipe name.");
    if (yieldQuantity == null || yieldQuantity <= 0) {
      return Alert.alert("Check the yield", "Enter how many one batch makes.");
    }
    if (wastePercent > 500) {
      return Alert.alert("Check waste", "Waste must be 500% or less.");
    }
    save.mutate(
      {
        name,
        yieldQuantity,
        yieldLabel,
        wastePercent,
        labourMinutes: Math.round(labourMinutes),
        labourRateCents: inputToCents(rate) ?? 0,
        overheadCents: inputToCents(overhead) ?? 0,
        instructions: notes.trim() || null,
      },
      {
        onSuccess: () => Alert.alert("Saved", "Recipe saved."),
        onError: (error) => Alert.alert("Couldn't save", error.message),
      },
    );
  }

  return (
    <Card title="Recipe settings">
      <FormField label="Name" value={name} onChangeText={setName} />
      <FormField
        label="One batch makes"
        value={yieldText}
        onChangeText={setYieldText}
        keyboardType="decimal-pad"
      />
      <FormField
        label="Unit name"
        value={yieldLabel}
        onChangeText={setYieldLabel}
      />
      <FormField
        label="Waste / failure %"
        value={waste}
        onChangeText={setWaste}
        keyboardType="decimal-pad"
        hint="Extra material lost to spills, offcuts or failed prints."
      />
      <FormField
        label="Labour minutes per batch"
        value={minutes}
        onChangeText={setMinutes}
        keyboardType="number-pad"
        hint="Hands-on time only."
      />
      <FormField
        label="Labour rate ($ / hour)"
        value={rate}
        onChangeText={setRate}
        keyboardType="decimal-pad"
        hint="Pay yourself. $0 hides what your time is worth."
      />
      <FormField
        label="Overhead per batch ($)"
        value={overhead}
        onChangeText={setOverhead}
        keyboardType="decimal-pad"
        hint="Oven or printer time, power, equipment wear."
      />
      <FormField
        label="Method / notes"
        value={notes}
        onChangeText={setNotes}
        multiline
      />
      <PrimaryButton
        label="Save recipe"
        loading={save.isPending}
        onPress={submit}
      />
    </Card>
  );
}
