import { StyleSheet, Text, View } from "react-native";
import type {
  CommunicationInput,
  ComposeOptionsResponse,
} from "@contracts/mobile/communication";
import { AUDIENCE_OPTIONS } from "@/lib/communication-labels";
import { colors, spacing } from "@/lib/theme";
import Card from "@/components/Card";
import ChipRow from "@/components/ChipRow";
import PickerField from "@/components/PickerField";

type Props = {
  values: CommunicationInput;
  set: (patch: Partial<CommunicationInput>) => void;
  options: ComposeOptionsResponse;
  /** Everyone on the chosen list; null while loading or no list chosen. */
  listEmails: string[] | null;
  /** Ticked list addresses; null means all of them. */
  listPicks: string[] | null;
  onListPicks: (emails: string[]) => void;
};

const single = (id: string | null) => (id ? [id] : []);

export default function ComposeAudienceCard({
  values,
  set,
  options,
  listEmails,
  listPicks,
  onListPicks,
}: Props) {
  const type = values.audienceType;
  const emailOptions = (listEmails ?? []).map((email) => ({
    id: email,
    label: email,
  }));
  return (
    <Card title="Who">
      <View style={styles.stack}>
        <ChipRow
          options={AUDIENCE_OPTIONS}
          value={type}
          onChange={(audienceType) => set({ audienceType })}
        />
        {type === "all_marketing" ? (
          <Text style={styles.hint}>
            Everyone who opted in to marketing emails.
          </Text>
        ) : null}
        {type === "list" ? (
          <>
            <PickerField
              label="List"
              options={options.lists}
              selected={single(values.listId)}
              multiple={false}
              placeholder="Choose a list…"
              onChange={(ids) => set({ listId: ids[0] ?? null })}
            />
            {values.listId ? (
              <PickerField
                label={`Recipients (${(listPicks ?? listEmails ?? []).length}/${listEmails?.length ?? 0})`}
                options={emailOptions}
                selected={listPicks ?? listEmails ?? []}
                multiple
                placeholder={listEmails ? "No one selected" : "Loading emails…"}
                onChange={onListPicks}
              />
            ) : null}
          </>
        ) : null}
        {type === "preorder_page" ? (
          <PickerField
            label="Bought via pre-order page"
            options={options.preOrderPages}
            selected={single(values.preOrderPageId)}
            multiple={false}
            placeholder="Choose a page…"
            onChange={(ids) => set({ preOrderPageId: ids[0] ?? null })}
          />
        ) : null}
        {type === "product" ? (
          <PickerField
            label="Bought any of these products"
            options={options.products}
            selected={values.productIds}
            multiple
            placeholder="Choose products…"
            onChange={(productIds) => set({ productIds })}
          />
        ) : null}
        {type === "customer" ? (
          <PickerField
            label="Customer"
            options={options.customers}
            selected={single(values.customerId)}
            multiple={false}
            placeholder="Choose a customer…"
            onChange={(ids) => set({ customerId: ids[0] ?? null })}
          />
        ) : null}
        <Text style={styles.hint}>
          People who unsubscribed are always left out.
        </Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  stack: { gap: spacing.md },
  hint: { color: colors.muted, fontSize: 12 },
});
