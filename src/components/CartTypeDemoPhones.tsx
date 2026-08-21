"use client";

import { useEffect, useState } from "react";
import BrandMark from "@/components/BrandMark";
import DemoPhoneFrame from "@/components/DemoPhoneFrame";

type Mode = "product" | "choice";

function useLoopStep(length: number, ms: number) {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => {
      setStep((s) => (s + 1) % length);
    }, ms);
    return () => window.clearInterval(id);
  }, [length, ms]);
  return step;
}

function StandDemoHeader({
  standName,
  subtitle,
}: {
  standName: string;
  subtitle: string;
}) {
  return (
    <div className="flex flex-col items-center text-center">
      <BrandMark className="size-7" link={false} />
      <p className="mt-1.5 text-[10px] font-bold leading-tight text-[var(--field)]">
        {standName}
      </p>
      <p className="mt-0.5 text-[8px] text-[var(--muted)]">{subtitle}</p>
    </div>
  );
}

function ProductCartScreen({ step }: { step: number }) {
  const showCart = step >= 2;
  const showPay = step >= 3;
  return (
    <div className="flex h-full flex-col bg-[var(--wash)] px-2.5 pb-2 pt-1 text-[9px] leading-tight text-[var(--ink)]">
      <StandDemoHeader standName="Green Valley Eggs" subtitle="Shop" />
      {!showCart && !showPay ? (
        <div className="mt-2 flex flex-1 flex-col gap-1.5">
          {[
            { name: "Dozen eggs", price: "$8.00", on: step >= 1 },
            { name: "Honey 500g", price: "$15.00", on: false },
            { name: "Veg box", price: "$35.00", on: false },
          ].map((p) => (
            <div
              key={p.name}
              className={`rounded-md border px-2 py-1.5 transition ${
                p.on
                  ? "border-[var(--leaf)] bg-[color-mix(in_srgb,var(--leaf)_12%,white)]"
                  : "border-[var(--line)] bg-[var(--panel)]"
              }`}
            >
              <div className="flex items-center justify-between gap-1">
                <span className="font-semibold">{p.name}</span>
                <span className="tabular-nums text-[var(--muted)]">{p.price}</span>
              </div>
              {p.on ? (
                <p className="mt-1 text-[8px] font-semibold text-[var(--leaf-dark)]">
                  Added ×1
                </p>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}
      {showCart && !showPay ? (
        <div className="mt-2 flex flex-1 flex-col gap-2">
          <p className="text-[10px] font-bold">Your cart</p>
          <div className="rounded-md border border-[var(--line)] bg-[var(--panel)] px-2 py-1.5">
            Dozen eggs ×1
            <span className="float-right tabular-nums">$8.00</span>
          </div>
          <p className="mt-auto text-right text-[11px] font-bold tabular-nums">
            Total $8.00
          </p>
          <div className="rounded-full bg-[var(--leaf)] py-1.5 text-center font-semibold text-white">
            Continue to payment
          </div>
        </div>
      ) : null}
      {showPay ? (
        <div className="mt-2 flex flex-1 flex-col gap-1.5">
          <p className="text-[10px] font-bold">How would you like to pay?</p>
          <div className="rounded-md bg-[var(--leaf)] px-2 py-2 font-semibold text-white">
            Pay cash
          </div>
          <div className="rounded-md border border-[var(--line)] bg-[var(--panel)] px-2 py-2 font-semibold">
            Card / Tap & Go
          </div>
          {step >= 4 ? (
            <p className="mt-auto text-center text-[10px] font-bold text-[var(--leaf-dark)]">
              Thank you
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function ChoiceCartScreen({ step }: { step: number }) {
  const entries =
    step === 0 ? [] : step === 1 ? [1000] : step >= 2 ? [1000, 500] : [];
  const total = entries.reduce((a, b) => a + b, 0);
  const showPay = step >= 3;
  return (
    <div className="flex h-full flex-col bg-[var(--wash)] px-2.5 pb-2 pt-1 text-[9px] leading-tight text-[var(--ink)]">
      <StandDemoHeader standName="Green Valley Eggs" subtitle="Pay what you picked" />
      {!showPay ? (
        <div className="mt-2 flex flex-1 flex-col gap-1.5">
          <p className="text-[8px] text-[var(--muted)]">
            Enter each price, then pay the total.
          </p>
          <div className="flex gap-1">
            <div className="flex-1 rounded-md border border-[var(--line)] bg-white px-2 py-1.5 text-[11px] font-semibold tabular-nums">
              {step === 0 ? "10.00" : step === 1 ? "5.00" : "0.00"}
            </div>
            <div className="rounded-md bg-[var(--leaf)] px-2.5 py-1.5 font-semibold text-white">
              Add
            </div>
          </div>
          {entries.map((cents, i) => (
            <div
              key={`${i}-${cents}`}
              className="flex justify-between rounded-md border border-[var(--line)] bg-[var(--panel)] px-2 py-1.5 font-semibold tabular-nums"
            >
              <span>${(cents / 100).toFixed(2)}</span>
            </div>
          ))}
          <p className="mt-auto text-[11px] font-bold tabular-nums">
            Total ${(total / 100).toFixed(2)}
          </p>
          <div
            className={`rounded-full py-1.5 text-center font-semibold text-white ${
              total > 0 ? "bg-[var(--leaf)]" : "bg-[var(--muted)]/40"
            }`}
          >
            Continue to pay
          </div>
        </div>
      ) : (
        <div className="mt-2 flex flex-1 flex-col gap-1.5">
          <p className="text-[11px] font-bold tabular-nums">Total $15.00</p>
          <div className="rounded-md bg-[var(--leaf)] px-2 py-2 font-semibold text-white">
            Pay cash
          </div>
          <div className="rounded-md border border-[var(--line)] bg-[var(--panel)] px-2 py-2 font-semibold">
            Card / Tap & Go
          </div>
          {step >= 4 ? (
            <p className="mt-auto text-center text-[10px] font-bold text-[var(--leaf-dark)]">
              Thank you · $15.00
            </p>
          ) : null}
        </div>
      )}
    </div>
  );
}

function DemoColumn({
  mode,
  title,
  blurb,
}: {
  mode: Mode;
  title: string;
  blurb: string;
}) {
  const step = useLoopStep(5, 1800);
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="text-center">
        <h3 className="font-[family-name:var(--font-display)] text-xl font-bold tracking-tight text-[var(--field)]">
          {title}
        </h3>
        <p className="mt-1 max-w-[16rem] text-sm text-[var(--muted)]">{blurb}</p>
      </div>
      <DemoPhoneFrame size="compact">
        {mode === "product" ? (
          <ProductCartScreen step={step} />
        ) : (
          <ChoiceCartScreen step={step} />
        )}
      </DemoPhoneFrame>
    </div>
  );
}

export default function CartTypeDemoPhones() {
  return (
    <div className="mt-10 grid gap-10 sm:grid-cols-2 sm:gap-8">
      <DemoColumn
        mode="product"
        title="Product cart"
        blurb="Browse what’s on the shelf, add items, then pay. Stock updates automatically."
      />
      <DemoColumn
        mode="choice"
        title="Customer Choice"
        blurb="No catalogue. Shoppers add dollar amounts as they pick items up, then pay the total."
      />
    </div>
  );
}
