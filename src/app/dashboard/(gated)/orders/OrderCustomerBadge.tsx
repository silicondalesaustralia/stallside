"use client";

import ShowCustomerBadge from "@/components/ShowCustomerBadge";
import OrderCustomerEmail from "../collections/OrderCustomerEmail";

export default function OrderCustomerBadge({
  orderId,
  customerName,
  customerPhone,
  email,
  defaultSubject,
}: {
  orderId: string;
  customerName: string | null;
  customerPhone: string | null;
  email: string | null;
  defaultSubject: string;
}) {
  return (
    <ShowCustomerBadge
      customerName={customerName}
      customerPhone={customerPhone}
      email={email}
      emailSlot={
        email ? (
          <OrderCustomerEmail
            orderId={orderId}
            email={email}
            defaultSubject={defaultSubject}
          />
        ) : null
      }
    />
  );
}
