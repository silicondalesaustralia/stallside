import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router, type Href } from "expo-router";
import type { MobileFeature } from "@contracts/mobile/me";
import { useAuth, useToken } from "@/auth/useAuth";
import { useMe } from "@/data/useMe";
import { openOnWeb } from "@/lib/open-web";
import { colors, spacing } from "@/lib/theme";
import FeatureRow from "@/components/FeatureRow";
import ErrorMessage from "@/components/ErrorMessage";

const NATIVE_ROUTES: Record<string, Href> = {
  overview: "/home",
  orders: "/orders",
  products: "/products",
  inventory: "/inventory",
  collections: "/collections",
  customers: "/customers",
  notifications: "/notifications",
  reviews: "/reviews",
  discounts: "/discounts",
  subscriptions: "/subscriptions",
  qr: "/qr",
  categories: "/categories",
  "pre-order-pages": "/pre-orders",
  upsells: "/upsells",
  communication: "/communication",
  shipping: "/shipping",
  suppliers: "/suppliers",
  calendar: "/calendar",
  payments: "/payments",
};

function groupFeatures(features: MobileFeature[]): [string, MobileFeature[]][] {
  const groups = new Map<string, MobileFeature[]>();
  for (const feature of features) {
    const key = feature.group ?? "General";
    groups.set(key, [...(groups.get(key) ?? []), feature]);
  }
  return [...groups.entries()];
}

export default function MoreScreen() {
  const { signOut } = useAuth();
  const token = useToken();
  const me = useMe();

  function openFeature(feature: MobileFeature) {
    const route = feature.native ? NATIVE_ROUTES[feature.id] : undefined;
    if (route) router.navigate(route);
    else void openOnWeb(feature.webPath, token);
  }

  if (me.isPending) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.brand} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <ErrorMessage error={me.error} />
      {me.data ? (
        <View style={styles.account}>
          <Text style={styles.name}>{me.data.owner.businessName}</Text>
          <Text style={styles.email}>{me.data.user.email}</Text>
        </View>
      ) : null}
      {me.data && !me.data.owner.onboardingComplete ? (
        <Pressable
          accessibilityRole="button"
          onPress={() => void openOnWeb("/onboarding", token)}
          style={styles.banner}
        >
          <Text style={styles.bannerText}>
            Finish setting up your business on the web
          </Text>
        </Pressable>
      ) : null}
      {groupFeatures(me.data?.features ?? []).map(([group, features]) => (
        <View key={group} style={styles.group}>
          <Text style={styles.groupHeading}>{group}</Text>
          {features.map((feature) => (
            <FeatureRow
              key={feature.id}
              feature={feature}
              onPress={openFeature}
            />
          ))}
        </View>
      ))}
      <Pressable
        accessibilityRole="button"
        onPress={() => void signOut()}
        style={styles.signOut}
      >
        <Text style={styles.signOutText}>Sign out</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
  },
  screen: { backgroundColor: colors.background },
  content: { paddingVertical: spacing.md, gap: spacing.lg },
  account: { paddingHorizontal: spacing.md },
  name: { color: colors.text, fontSize: 20, fontWeight: "700" },
  email: { color: colors.muted },
  banner: {
    marginHorizontal: spacing.md,
    backgroundColor: colors.brand,
    borderRadius: 12,
    padding: spacing.md,
  },
  bannerText: { color: colors.brandText, fontWeight: "600" },
  group: { gap: 0 },
  groupHeading: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xs,
  },
  signOut: { alignItems: "center", padding: spacing.md },
  signOutText: { color: colors.danger, fontWeight: "600" },
});
