import OrderConfirmationCard from "@/components/checkout/OrderConfirmationCard";
import { resolveCheckoutSuccess } from "./resolve-checkout-success";
import { APP_NAME } from "@/lib/constants";

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{
    session_id?: string;
    order_id?: string;
    paypal?: string;
    token?: string;
    sub?: string;
  }>;
}) {
  const state = await resolveCheckoutSuccess(await searchParams);

  return (
    <main className="mx-auto flex min-h-full max-w-lg flex-1 flex-col justify-center px-6 py-16">
      <OrderConfirmationCard state={state} backHref="/" backLabel={`Back to ${APP_NAME}`} />
    </main>
  );
}
