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
        <Stack.Screen
          name="product/[productId]"
          options={{ title: "Product" }}
        />
        <Stack.Screen name="inventory" options={{ title: "Inventory" }} />
        <Stack.Screen
          name="notifications"
          options={{ title: "Notifications" }}
        />
        <Stack.Screen name="reviews/index" options={{ title: "Reviews" }} />
        <Stack.Screen name="reviews/[reviewId]" options={{ title: "Review" }} />
        <Stack.Screen name="discounts/index" options={{ title: "Discounts" }} />
        <Stack.Screen
          name="discounts/[discountId]"
          options={{ title: "Discount" }}
        />
        <Stack.Screen
          name="subscriptions/index"
          options={{ title: "Subscriptions" }}
        />
        <Stack.Screen
          name="subscriptions/[offerId]"
          options={{ title: "Subscription" }}
        />
        <Stack.Screen
          name="categories/index"
          options={{ title: "Categories" }}
        />
        <Stack.Screen
          name="categories/[categoryId]/index"
          options={{ title: "Category" }}
        />
        <Stack.Screen
          name="categories/[categoryId]/products"
          options={{ title: "Choose products" }}
        />
        <Stack.Screen
          name="pre-orders/index"
          options={{ title: "Pre-order pages" }}
        />
        <Stack.Screen
          name="pre-orders/[pageId]"
          options={{ title: "Pre-order page" }}
        />
        <Stack.Screen
          name="upsells/index"
          options={{ title: "Upsells & offers" }}
        />
        <Stack.Screen name="upsells/[upsellId]" options={{ title: "Upsell" }} />
        <Stack.Screen name="qr/index" options={{ title: "QR codes" }} />
        <Stack.Screen name="qr/[kind]/[id]" options={{ title: "QR code" }} />
        <Stack.Screen
          name="collections"
          options={{ title: "Pick ups & delivery" }}
        />
        <Stack.Screen name="customers/index" options={{ title: "Customers" }} />
        <Stack.Screen
          name="customers/[customerId]"
          options={{ title: "Customer" }}
        />
      </Stack>
    </BusinessProvider>
  );
}
