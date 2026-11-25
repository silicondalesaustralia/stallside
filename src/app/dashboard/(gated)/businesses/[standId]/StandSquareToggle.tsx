import PaymentBrandIcon from "@/components/PaymentBrandIcon";
import CheckoutPaymentRow from "./CheckoutPaymentRow";

export default function StandSquareToggle({
  acceptSquare,
  squareReady,
  squareIsProvider,
}: {
  acceptSquare: boolean;
  squareReady: boolean;
  squareIsProvider: boolean;
}) {
  const hint = !squareReady
    ? "Connect Square above first, then turn on payments and pick a location."
    : squareIsProvider
      ? "Square card checkout for QR codes and your website. Money to your Square account."
      : "Shown at checkout once Square is your product checkout provider above.";

  return (
    <CheckoutPaymentRow
      name="acceptSquare"
      checked={acceptSquare}
      disabled={!squareReady}
      label={
        <>
          <PaymentBrandIcon brand="square" className="size-5" />
          Square
        </>
      }
      hint={hint}
    />
  );
}
