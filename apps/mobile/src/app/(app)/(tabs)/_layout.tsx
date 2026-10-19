import { Tabs } from "expo-router/js-tabs";
import { colors } from "@/lib/theme";
import TabIcon, { type TabIconName, type TabIconRenderProps } from "@/components/TabIcon";

function icon(name: TabIconName) {
  return function renderTabIcon(props: TabIconRenderProps) {
    return <TabIcon name={name} {...props} />;
  };
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        tabBarActiveTintColor: colors.brand,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: { fontSize: 12, fontWeight: "600" },
      }}
    >
      <Tabs.Screen name="home" options={{ title: "Home", tabBarIcon: icon("home") }} />
      <Tabs.Screen name="orders" options={{ title: "Orders", tabBarIcon: icon("receipt") }} />
      <Tabs.Screen name="products" options={{ title: "Products", tabBarIcon: icon("pricetags") }} />
      <Tabs.Screen name="more" options={{ title: "More", tabBarIcon: icon("ellipsis-horizontal-circle") }} />
    </Tabs>
  );
}
