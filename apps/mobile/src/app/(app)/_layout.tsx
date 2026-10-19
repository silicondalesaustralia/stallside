import { Redirect, Stack } from "expo-router";
import { useAuth, useToken } from "@/auth/useAuth";
import BusinessProvider from "@/business/BusinessProvider";
import { usePushRegistration } from "@/push/usePushRegistration";
import { colors } from "@/lib/theme";

/** Signed-in area: tabs at the root, detail screens pushed on top with a back button. */
export default function SignedInLayout() {
  const { state } = useAuth();
  const token = useToken();
  usePushRegistration(token);

  if (state.status === "signedOut") return <Redirect href="/sign-in" />;

  return (
    <BusinessProvider>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerBackTitle: "Back",
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="order/[orderId]" options={{ title: "Order" }} />
        <Stack.Screen name="product/[productId]" options={{ title: "Product" }} />
        <Stack.Screen name="inventory" options={{ title: "Inventory" }} />
        <Stack.Screen name="collections" options={{ title: "Pick ups & delivery" }} />
        <Stack.Screen name="customers/index" options={{ title: "Customers" }} />
        <Stack.Screen name="customers/[customerId]" options={{ title: "Customer" }} />
      </Stack>
    </BusinessProvider>
  );
}
