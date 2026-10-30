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
        <Stack.Screen
          name="communication/index"
          options={{ title: "Communications" }}
        />
        <Stack.Screen
          name="communication/new"
          options={{ title: "New message" }}
        />
        <Stack.Screen
          name="communication/[campaignId]"
          options={{ title: "Message" }}
        />
        <Stack.Screen name="shipping" options={{ title: "Shipping" }} />
        <Stack.Screen name="calendar" options={{ title: "Calendar" }} />
        <Stack.Screen name="payments" options={{ title: "Payments" }} />
        <Stack.Screen name="account" options={{ title: "Account" }} />
        <Stack.Screen name="guides/index" options={{ title: "Guides" }} />
        <Stack.Screen name="guides/[slug]" options={{ title: "Guide" }} />
        <Stack.Screen name="suppliers/index" options={{ title: "Suppliers" }} />
        <Stack.Screen
          name="suppliers/[memberId]"
          options={{ title: "Supplier" }}
        />
        <Stack.Screen name="qr/index" options={{ title: "QR codes" }} />
        <Stack.Screen name="qr/[kind]/[id]" options={{ title: "QR code" }} />
        <Stack.Screen
          name="collections/index"
          options={{ title: "Pick ups & delivery" }}
        />
        <Stack.Screen
          name="collections/email"
          options={{ title: "Email customers" }}
        />
        <Stack.Screen name="production/index" options={{ title: "Batches" }} />
        <Stack.Screen
          name="production/new"
          options={{ title: "Record a batch" }}
        />
        <Stack.Screen
          name="production/profit"
          options={{ title: "Profit & loss" }}
        />
        <Stack.Screen
          name="production/materials/index"
          options={{ title: "Materials" }}
        />
        <Stack.Screen
          name="production/materials/[ingredientId]"
          options={{ title: "Material" }}
        />
        <Stack.Screen
          name="production/materials/purchase"
          options={{ title: "Record a purchase" }}
        />
        <Stack.Screen
          name="production/materials/scan"
          options={{ title: "Check the invoice" }}
        />
        <Stack.Screen name="referrals" options={{ title: "Referrals" }} />
        <Stack.Screen name="settings/tax" options={{ title: "Tax" }} />
        <Stack.Screen name="customers/index" options={{ title: "Customers" }} />
        <Stack.Screen
          name="customers/[customerId]"
          options={{ title: "Customer" }}
        />
      </Stack>
    </BusinessProvider>
  );
}
