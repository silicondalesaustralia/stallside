export type QrPrintSize = "a4" | "half" | "quarter";

/** Shared compact (half/quarter) sheet rules — also mirrored in globals for on-page previews. */
export const QR_COMPACT_SHEET_CSS = `
  .qr-print-sheet--compact {
    display: grid !important;
    grid-template-columns: minmax(0, 1.2fr) auto;
    grid-template-areas:
      "head head"
      "body qr"
      "foot foot";
    column-gap: 3mm;
    row-gap: 1.5mm;
    align-items: center;
    box-sizing: border-box;
    height: 100%;
    width: 100%;
    padding: 4mm !important;
    text-align: left;
    overflow: hidden !important;
  }
  .qr-print-sheet--compact .qr-sign-corner {
    display: none !important;
  }
  .qr-print-sheet--compact .qr-sign-head {
    grid-area: head;
    text-align: center;
  }
  .qr-print-sheet--compact .qr-sign-body {
    grid-area: body;
    min-width: 0;
    max-height: 100%;
    overflow: hidden;
    align-self: center;
  }
  .qr-print-sheet--compact .qr-sign-qr {
    grid-area: qr;
    text-align: center;
    justify-self: end;
    align-self: center;
    flex-shrink: 0;
  }
  .qr-print-sheet--compact .qr-sign-foot {
    grid-area: foot;
    text-align: center;
  }
  .qr-print-sheet--compact .qr-sign-code {
    margin: 0 auto !important;
    width: 40mm !important;
    max-width: 40mm !important;
    height: auto !important;
  }
  .qr-print-sheet--compact .qr-sign-head h1 {
    margin-top: 1mm !important;
    margin-bottom: 0 !important;
    font-size: 1.2rem !important;
    line-height: 1.15 !important;
  }
  .qr-print-sheet--compact .safe-sign-html,
  .qr-print-sheet--compact .safe-sign-html *,
  .qr-print-sheet--compact .qr-sign-body p {
    font-size: 0.78rem !important;
    line-height: 1.25 !important;
    margin-top: 1mm !important;
    margin-bottom: 0 !important;
  }
  .qr-print-sheet--compact .qr-sign-callout,
  .qr-print-sheet--compact .qr-sign-callout * {
    font-size: 1rem !important;
    margin-top: 1.5mm !important;
  }
  .qr-print-sheet--compact .qr-sign-foot .font-receipt {
    font-size: 7px !important;
    line-height: 1.2 !important;
    max-width: 100%;
    margin-left: auto !important;
    margin-right: auto !important;
    text-align: center !important;
  }
  .qr-print-sheet--compact .qr-sign-foot > p:last-child {
    font-size: 0.75rem !important;
    margin-top: 1mm !important;
    margin-left: auto !important;
    margin-right: auto !important;
    text-align: center !important;
  }
`;

export const QR_PRINT_SIZE_CSS: Record<QrPrintSize, string> = {
  a4: `
    .qr-print-layout {
      width: 210mm;
      min-height: 297mm;
    }
    .qr-print-tile {
      width: 210mm;
      min-height: 297mm;
      padding: 10mm;
      box-sizing: border-box;
    }
    .qr-print-tile .qr-print-sheet { padding: 6mm !important; }
    .qr-print-tile .qr-sign-code { max-width: 90mm !important; }
  `,
  half: `
    ${QR_COMPACT_SHEET_CSS}
    .qr-print-layout {
      width: 210mm;
      height: 297mm;
      display: grid;
      grid-template-rows: 1fr 1fr;
    }
    .qr-print-tile {
      width: 210mm;
      height: 148.5mm;
      padding: 4mm;
      box-sizing: border-box;
      overflow: hidden;
      border-bottom: 1px dashed #9aab92;
    }
    .qr-print-tile:last-child { border-bottom: none; }
    .qr-print-sheet--half.qr-print-sheet--compact {
      grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) !important;
      column-gap: 4mm;
      row-gap: 2mm;
      padding: 4mm 5mm !important;
    }
    .qr-print-sheet--half .qr-sign-head h1 {
      margin-top: 3mm !important;
      font-size: 1.45rem !important;
    }
    .qr-print-sheet--half .qr-sign-qr {
      justify-self: center !important;
      align-self: center !important;
      width: 100%;
      max-width: 100%;
    }
    .qr-print-sheet--half .qr-sign-code {
      width: 100% !important;
      max-width: 90mm !important;
      max-height: 55mm !important;
      height: auto !important;
      margin: 0 auto !important;
      object-fit: contain !important;
    }
    .qr-print-sheet--half .qr-sign-callout,
    .qr-print-sheet--half .qr-sign-callout * {
      font-size: 1.05rem !important;
    }
    .qr-print-sheet--half .safe-sign-html,
    .qr-print-sheet--half .safe-sign-html *,
    .qr-print-sheet--half .qr-sign-body p {
      font-size: 0.82rem !important;
      line-height: 1.3 !important;
    }
  `,
  quarter: `
    ${QR_COMPACT_SHEET_CSS}
    .qr-print-layout {
      width: 210mm;
      height: 297mm;
      display: grid;
      grid-template-columns: 1fr 1fr;
      grid-template-rows: 1fr 1fr;
    }
    .qr-print-tile {
      width: 105mm;
      height: 148.5mm;
      padding: 3mm;
      box-sizing: border-box;
      overflow: hidden;
      border-right: 1px dashed #9aab92;
      border-bottom: 1px dashed #9aab92;
    }
    .qr-print-tile:nth-child(2n) { border-right: none; }
    .qr-print-tile:nth-child(n+3) { border-bottom: none; }
    .qr-print-sheet--compact {
      padding: 3mm !important;
      column-gap: 2mm;
      row-gap: 1mm;
    }
    .qr-print-sheet--compact .qr-sign-code {
      width: 32mm !important;
      max-width: 32mm !important;
    }
    .qr-print-sheet--compact .qr-sign-head h1 {
      font-size: 1rem !important;
      margin-top: 2.5mm !important;
    }
    .qr-print-sheet--compact .safe-sign-html,
    .qr-print-sheet--compact .qr-sign-body p {
      font-size: 0.65rem !important;
    }
    .qr-print-sheet--compact .qr-sign-callout {
      font-size: 0.85rem !important;
    }
    .qr-print-sheet--compact .qr-sign-foot .font-receipt {
      font-size: 6px !important;
    }
    .qr-print-sheet--compact .qr-sign-foot .text-sm {
      font-size: 0.7rem !important;
    }
  `,
};
