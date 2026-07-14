export type QrPrintSize = "a4" | "half" | "quarter";

/** Shared compact (half/quarter) sheet rules — also mirrored in globals for on-page previews. */
export const QR_COMPACT_SHEET_CSS = `
  .qr-print-sheet--compact {
    display: grid !important;
    grid-template-columns: minmax(0, 1fr) auto;
    grid-template-areas:
      "head head"
      "body qr";
    column-gap: 4mm;
    row-gap: 2mm;
    align-items: center;
    box-sizing: border-box;
    height: 100%;
    width: 100%;
    padding: 5mm !important;
    text-align: left;
    overflow: hidden !important;
  }
  .qr-print-sheet--compact .qr-sign-head {
    grid-area: head;
    text-align: center;
  }
  .qr-print-sheet--compact .qr-sign-body {
    grid-area: body;
    min-width: 0;
    align-self: center;
  }
  .qr-print-sheet--compact .qr-sign-qr {
    grid-area: qr;
    text-align: center;
    justify-self: end;
  }
  .qr-print-sheet--compact .qr-sign-code {
    margin: 0 auto !important;
    width: 42mm !important;
    max-width: 42mm !important;
    height: auto !important;
  }
  .qr-print-sheet--compact .qr-sign-head h1 {
    margin-top: 2mm !important;
    font-size: 1.35rem !important;
  }
  .qr-print-sheet--compact .safe-sign-html {
    font-size: 0.82rem !important;
    margin-top: 1.5mm !important;
    margin-bottom: 0 !important;
  }
  .qr-print-sheet--compact .safe-sign-html p {
    margin-bottom: 0.2em !important;
  }
  .qr-print-sheet--compact .qr-sign-callout {
    font-size: 1.15rem !important;
    margin-top: 2mm !important;
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
    .qr-print-sheet--compact .qr-sign-code {
      width: 48mm !important;
      max-width: 48mm !important;
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
    }
    .qr-print-sheet--compact .safe-sign-html,
    .qr-print-sheet--compact .qr-sign-body p {
      font-size: 0.65rem !important;
    }
    .qr-print-sheet--compact .qr-sign-callout {
      font-size: 0.85rem !important;
    }
    .qr-print-sheet--compact .qr-sign-qr .font-receipt {
      font-size: 6px !important;
    }
    .qr-print-sheet--compact .qr-sign-qr .text-sm {
      font-size: 0.7rem !important;
    }
  `,
};
