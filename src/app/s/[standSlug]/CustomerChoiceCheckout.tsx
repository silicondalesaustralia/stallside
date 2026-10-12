"use client";

import { useEffect, useState, useTransition } from "react";
import CheckoutCashConfirm from "./CheckoutCashConfirm";
import CheckoutLocalTransferConfirm from "./CheckoutLocalTransferConfirm";
import CheckoutPayStep from "./CheckoutPayStep";
import {
  confirmCashCheckout,
  confirmLocalTransferCheckout,
} from "./actions";
import { startCardCheckout } from "./digital-checkout-actions";
import { formatMoney } from "@/lib/public-product";
import { dollarsToCents, stallsidePassOnFeeCents } from "@/lib/money";
import {
  CUSTOMER_CHOICE_MAX_CENTS,
  CUSTOMER_CHOICE_MIN_CENTS,
} from "@/lib/customer-choice-constants";
import {
  addChoiceEntry,
  clearChoiceCart,
  getChoiceCartEpoch,
  readChoiceEntries,
  removeChoiceEntry,
  subscribeChoiceCart,
} from "@/lib/stand-choice-cart-storage";

type LocalTransferInfo = {
  methodId: string;
  buttonLabel: string;
  aliasLabel: string;
  alias: string;
};

type Step = "amount" | "pay" | "cash-confirm" | "lt-confirm";

export default function CustomerChoiceCheckout({
  standSlug,
  currency,
  cashEnabled,
  cardEnabled,
  paypalEnabled,
  paypalClientId,
  paypalMerchantId,
  paypalSandbox,
  localTransfer,
  passFeeToCustomer,
  stallsideFeeApplies,
  showDemoCardHint,
}: {
  standSlug: string;
  currency: string;
  cashEnabled: boolean;
  cardEnabled: boolean;
  paypalEnabled: boolean;
  paypalClientId: string | null;
  paypalMerchantId: string | null;
  paypalSandbox: boolean;
  localTransfer: LocalTransferInfo | null;
  passFeeToCustomer: boolean;
  stallsideFeeApplies: boolean;
  showDemoCardHint?: boolean;
}) {
  const [epoch, setEpoch] = useState(0);
  const [amountInput, setAmountInput] = useState("");
  const [step, setStep] = useState<Step>("amount");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [done, setDone] = useState(false);
  const [paidTotalCents, setPaidTotalCents] = useState(0);
  const [paidVia, setPaidVia] = useState<"cash" | "local_transfer" | null>(
    null,
  );
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");

  useEffect(() => {
    return subscribeChoiceCart(() => setEpoch(getChoiceCartEpoch()));
  }, []);

  const entries = readChoiceEntries(standSlug);
  void epoch;
  const totalCents = entries.reduce((sum, n) => sum + n, 0);
  const cardFeeCents =
    stallsideFeeApplies && passFeeToCustomer && totalCents > 0
      ? stallsidePassOnFeeCents(totalCents)
      : 0;
  const amountLabel = formatMoney(totalCents, currency);

  function addAmount() {
    setError(null);
    let cents: number;
    try {
      cents = dollarsToCents(amountInput.trim());
    } catch {
      setError("Enter a valid amount.");
      return;
    }
    if (cents < CUSTOMER_CHOICE_MIN_CENTS) {
      setError(
        `Enter at least ${formatMoney(CUSTOMER_CHOICE_MIN_CENTS, currency)}.`,
      );
      return;
    }
    if (totalCents + cents > CUSTOMER_CHOICE_MAX_CENTS) {
      setError(
        `Total cannot exceed ${formatMoney(CUSTOMER_CHOICE_MAX_CENTS, currency)}.`,
      );
      return;
    }
    addChoiceEntry(standSlug, cents);
    setAmountInput("");
  }

  function goPay() {
    setError(null);
    if (totalCents < CUSTOMER_CHOICE_MIN_CENTS) {
      setError(
        `Add at least ${formatMoney(CUSTOMER_CHOICE_MIN_CENTS, currency)}.`,
      );
      return;
    }
    setStep("pay");
  }

  function finishOk(via: "cash" | "local_transfer") {
    setPaidTotalCents(totalCents);
    clearChoiceCart(standSlug);
    setPaidVia(via);
    setDone(true);
  }

  function payCash() {
    setError(null);
    startTransition(async () => {
      const result = await confirmCashCheckout({
        standSlug,
        customerChoiceAmountCents: totalCents,
        receiptEmail: customerEmail.trim() || null,
      });
      if ("error" in result && result.error) {
        setError(result.error);
        return;
      }
      if ("orderNumber" in result) finishOk("cash");
    });
  }

  function payLocalTransfer() {
    setError(null);
    startTransition(async () => {
      const result = await confirmLocalTransferCheckout({
        standSlug,
        customerChoiceAmountCents: totalCents,
        receiptEmail: customerEmail.trim() || null,
      });
      if ("error" in result && result.error) {
        setError(result.error);
        return;
      }
      if ("orderNumber" in result) finishOk("local_transfer");
    });
  }

  function payCard() {
    setError(null);
    startTransition(async () => {
      const result = await startCardCheckout({
        standSlug,
        customerChoiceAmountCents: totalCents,
        customerEmail: customerEmail.trim() || undefined,
        customerName: customerName.trim() || undefined,
        customerPhone: customerPhone.trim() || undefined,
      });
      if ("error" in result && result.error) {
        setError(result.error);
        return;
      }
      if ("url" in result && result.url) {
        clearChoiceCart(standSlug);
        window.location.href = result.url;
      }
    });
  }

  if (done) {
    return (
      <div className="mt-10 flex flex-col gap-4">
        <div className="rounded-[var(--radius)] border border-[var(--line)] bg-[var(--panel)] p-8">
          <h2 className="font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight">
            Thank you
          </h2>
          <p className="mt-3 text-xl text-[var(--muted)]">
            {paidVia === "local_transfer"
              ? "Marked as paid. The owner will see this in their account shortly."
              : "Cash payment confirmed. You're all set."}
          </p>
          <p className="mt-2 font-receipt text-2xl font-semibold">
            {formatMoney(paidTotalCents, currency)}
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setDone(false);
            setPaidVia(null);
            setStep("amount");
          }}
          className="text-center font-semibold text-[var(--leaf-dark)] underline"
        >
          Start another payment
        </button>
      </div>
    );
  }

  return (
    <div className="mt-6 flex flex-col gap-4">
      {error ? (
        <p className="rounded-lg border border-[var(--gone)]/40 bg-[var(--panel)] px-3 py-2 text-sm text-[var(--gone)]">
          {error}
        </p>
      ) : null}

      {step === "amount" ? (
        <>
          <p className="text-lg text-[var(--muted)]">
            Enter each price you picked up, then pay the total.
          </p>
          <div className="flex gap-2">
            <label className="sr-only" htmlFor="choice-amount">
              Amount
            </label>
            <input
              id="choice-amount"
              inputMode="decimal"
              placeholder="0.00"
              value={amountInput}
              onChange={(e) => setAmountInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addAmount();
                }
              }}
              className="min-w-0 flex-1 rounded-lg border border-[var(--line)] bg-white px-4 py-3 text-2xl font-semibold tabular-nums"
            />
            <button
              type="button"
              onClick={addAmount}
              className="rounded-[var(--radius)] bg-[var(--leaf)] px-5 py-3 text-lg font-semibold text-white"
            >
              Add
            </button>
          </div>
          {entries.length > 0 ? (
            <ul className="flex flex-col gap-2">
              {entries.map((cents, index) => (
                <li
                  key={`${index}-${cents}`}
                  className="flex items-center justify-between rounded-lg border border-[var(--line)] bg-[var(--panel)] px-4 py-3 text-lg"
                >
                  <span className="font-semibold tabular-nums">
                    {formatMoney(cents, currency)}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeChoiceEntry(standSlug, index)}
                    className="text-sm font-medium text-[var(--muted)] underline"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
          <p className="text-2xl font-bold tabular-nums">
            Total {formatMoney(totalCents, currency)}
          </p>
          <button
            type="button"
            disabled={totalCents < CUSTOMER_CHOICE_MIN_CENTS}
            onClick={goPay}
            className="w-full rounded-[var(--radius)] bg-[var(--leaf)] px-5 py-4 text-xl font-semibold text-white disabled:opacity-50"
          >
            Continue to pay
          </button>
        </>
      ) : null}

      {step === "pay" ? (
        <>
          <p className="text-2xl font-bold">Total {amountLabel}</p>
          <CheckoutPayStep
            cashEnabled={cashEnabled}
            cardEnabled={cardEnabled}
            paypalEnabled={paypalEnabled}
            paypalClientId={paypalClientId}
            paypalMerchantId={paypalMerchantId}
            paypalSandbox={paypalSandbox}
            currency={currency}
            standSlug={standSlug}
            customerChoiceAmountCents={totalCents}
            subtotalCents={totalCents}
            cardFeeCents={cardFeeCents}
            cardTotalCents={totalCents + cardFeeCents}
            localTransferLabel={localTransfer?.buttonLabel ?? null}
            pending={pending}
            showDemoCardHint={showDemoCardHint}
            customerName={customerName}
            customerEmail={customerEmail}
            customerPhone={customerPhone}
            onCustomerName={setCustomerName}
            onCustomerEmail={setCustomerEmail}
            onCustomerPhone={setCustomerPhone}
            onCash={() => setStep("cash-confirm")}
            onLocalTransfer={() => setStep("lt-confirm")}
            onCard={payCard}
            onPayPalError={setError}
            onBack={() => setStep("amount")}
            backLabel="Back to amounts"
          />
        </>
      ) : null}

      {step === "cash-confirm" ? (
        <CheckoutCashConfirm
          amountLabel={amountLabel}
          pending={pending}
          onConfirm={payCash}
          onBack={() => setStep("pay")}
        />
      ) : null}

      {step === "lt-confirm" && localTransfer ? (
        <CheckoutLocalTransferConfirm
          amountLabel={amountLabel}
          aliasLabel={localTransfer.aliasLabel}
          alias={localTransfer.alias}
          buttonLabel={localTransfer.buttonLabel}
          pending={pending}
          onConfirm={payLocalTransfer}
          onBack={() => setStep("pay")}
        />
      ) : null}
    </div>
  );
}
