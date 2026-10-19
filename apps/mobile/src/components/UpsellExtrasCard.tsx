import { Pressable, StyleSheet, Text, View } from "react-native";
import type { UpsellsResponse } from "@contracts/mobile/upsells";
import { useToken } from "@/auth/useAuth";
import { openPreOrderPage, openProduct } from "@/lib/navigation";
import { openOnWeb } from "@/lib/open-web";
import { colors, spacing } from "@/lib/theme";
import Card from "@/components/Card";

type Linked = UpsellsResponse["productOverrides"][number];

function LinkedList({
  items,
  empty,
  onOpen,
}: {
  items: Linked[];
  empty: string;
  onOpen: (id: string) => void;
}) {
  if (items.length === 0) return <Text style={styles.meta}>{empty}</Text>;
  return items.map((item) => (
    <Pressable
      key={item.id}
      accessibilityRole="button"
      onPress={() => onOpen(item.id)}
      style={styles.item}
    >
      <Text style={styles.name}>{item.name}</Text>
      <Text style={styles.meta}>offers {item.offers}</Text>
    </Pressable>
  ));
}

/** Business default, first-order discount, and add-ons set on products and pre-order pages. */
export default function UpsellExtrasCard({ data }: { data: UpsellsResponse }) {
  const token = useToken();
  const edit = (
    <Pressable
      accessibilityRole="link"
      onPress={() => void openOnWeb("/dashboard/upsells", token)}
    >
      <Text style={styles.link}>Edit on web</Text>
    </Pressable>
  );
  return (
    <View style={styles.wrap}>
      <Card title="Business default" action={edit}>
        <Text style={styles.meta}>
          Used when no upsell above fits the cart.
        </Text>
        <Text style={styles.name}>
          {data.defaultUpsell ?? "No default upsell"}
        </Text>
        <Text style={styles.name}>
          {data.firstOrderDiscount ?? "No first-order discount"}
        </Text>
      </Card>
      <Card title="Product-specific upsells">
        <LinkedList
          items={data.productOverrides}
          empty="None set. Set one on a product."
          onOpen={openProduct}
        />
      </Card>
      <Card title="Pre-order add-ons">
        <LinkedList
          items={data.preOrderAddOns}
          empty="None set. Set one on a pre-order page."
          onOpen={openPreOrderPage}
        />
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.md, marginTop: spacing.md },
  item: { paddingVertical: spacing.xs, gap: 2 },
  name: { color: colors.text, fontSize: 15, fontWeight: "600" },
  meta: { color: colors.muted, fontSize: 13 },
  link: { color: colors.brand, fontWeight: "600" },
});
