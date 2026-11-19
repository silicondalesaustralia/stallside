"use client";

import { useState, type KeyboardEvent } from "react";

const TAB_DATA = {
  products: {
    headers: ["Product", "Size", "Price"],
    rows: [
      ["Forest Amber", "250 g", "$18.00"],
      ["Vanilla Grove", "250 g", "$16.00"],
      ["Cedar & Fig", "250 g", "$20.00"],
    ],
  },
  orders: {
    headers: ["Order", "Items", "Status"],
    rows: [
      ["Example #1042", "2 candles", "Ready to ship"],
      ["Example #1043", "1 candle", "Preparing"],
      ["Example #1044", "3 candles", "Paid"],
    ],
  },
  stock: {
    headers: ["Product", "Available", "Stock status"],
    rows: [
      ["Forest Amber", "36", "In stock"],
      ["Vanilla Grove", "28", "In stock"],
      ["Cedar & Fig", "14", "In stock"],
    ],
  },
} as const;

type TabId = keyof typeof TAB_DATA;
const TAB_IDS = Object.keys(TAB_DATA) as TabId[];

export default function SellDashboardTabs() {
  const [active, setActive] = useState<TabId>("products");
  const data = TAB_DATA[active];

  function onKey(e: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next: number | undefined;
    if (e.key === "ArrowRight") next = (index + 1) % TAB_IDS.length;
    else if (e.key === "ArrowLeft") next = (index - 1 + TAB_IDS.length) % TAB_IDS.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = TAB_IDS.length - 1;
    else return;
    e.preventDefault();
    const id = TAB_IDS[next]!;
    setActive(id);
    document.getElementById(`tab-${id}`)?.focus();
  }

  return (
    <div className="visual dashboard">
      <div className="browser-bar">
        <span className="dots">•••</span>
        <span className="demo-label">Illustrative dashboard concept</span>
      </div>
      <div className="dash-body">
        <div className="tabs" role="tablist" aria-label="Example dashboard">
          {TAB_IDS.map((id, i) => (
            <button
              key={id}
              type="button"
              role="tab"
              id={`tab-${id}`}
              aria-selected={active === id}
              tabIndex={active === id ? 0 : -1}
              aria-controls="dashboard-panel"
              data-tab={id}
              onClick={() => setActive(id)}
              onKeyDown={(e) => onKey(e, i)}
            >
              {id[0]!.toUpperCase() + id.slice(1)}
            </button>
          ))}
        </div>
        <div
          id="dashboard-panel"
          role="tabpanel"
          aria-labelledby={`tab-${active}`}
        >
          <table>
            <thead>
              <tr>
                {data.headers.map((h) => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.rows.map((row) => (
                <tr key={row.join("-")}>
                  {row.map((cell) => (
                    <td key={cell}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
