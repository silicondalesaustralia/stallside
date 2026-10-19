import { Pressable, StyleSheet, Text } from "react-native";
import type { MobileOrderDetail } from "@contracts/mobile/order-detail";
import { mailtoUrl, openLink } from "@/lib/open-link";
import { colors } from "@/lib/theme";
import Card from "@/components/Card";

export default function OrderCustomerCard({ order }: { order: MobileOrderDetail }) {
  const { name, phone, email } = order.customer;
  return (
    <Card title="Customer">
      <Text style={styles.name}>{name || "No name given"}</Text>
      {phone ? (
        <Pressable accessibilityRole="link" onPress={() => void openLink(`tel:${phone}`)}>
          <Text style={styles.link}>{phone}</Text>
        </Pressable>
      ) : null}
      {email ? (
        <Pressable
          accessibilityRole="link"
          onPress={() => void openLink(mailtoUrl(email, `${order.standName} · order ${order.orderNumber}`))}
        >
          <Text style={styles.link}>{email}</Text>
        </Pressable>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  name: { color: colors.text, fontSize: 15, fontWeight: "600" },
  link: { color: colors.brand, fontSize: 15, textDecorationLine: "underline" },
});
