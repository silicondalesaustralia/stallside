import dotenv from "dotenv";
dotenv.config({ override: true });
import { createPayPalCheckoutOrder } from "../src/lib/paypal-orders";

async function main() {
  const merchantId = process.argv[2] ?? "SSJUY28QVMTD2";
  const fee = Number(process.argv[3] ?? "13");
  const total = Number(process.argv[4] ?? "513");
  try {
    const order = await createPayPalCheckoutOrder({
      merchantId,
      orderId: "test-order-id",
      currency: "AUD",
      totalCents: total,
      platformFeeCents: fee,
      description: "eggtopia test",
      successUrl: "http://localhost:3000/checkout/success?order_id=test",
      cancelUrl: "http://localhost:3000/checkout/cancelled",
    });
    console.log("OK", order);
  } catch (error) {
    console.error("FAIL", error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

main();
