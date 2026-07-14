export type QrPrintSize = "a4" | "half" | "quarter";

export const QR_PRINT_SIZE_CSS: Record<QrPrintSize, string> = {
  a4: `
    .qr-print-layout {
      width: 210mm;
      min-height: 297mm;
    }
    .qr-print-tile {
      width: 210mm;
      min-height: 297mm;
      padding: 12mm;
      box-sizing: border-box;
    }
    .qr-print-tile .qr-print-sheet { padding: 6mm !important; }
    .qr-print-tile .qr-print-sheet img { max-width: 90mm !important; }
    .qr-print-tile .qr-print-sheet h1 { font-size: 2rem !important; }
    .qr-print-tile .safe-sign-html { font-size: 1.05rem !important; }
  `,
  half: `
    .qr-print-layout {
      width: 210mm;
      height: 297mm;
      display: grid;
      grid-template-rows: 1fr 1fr;
    }
    .qr-print-tile {
      width: 210mm;
      height: 148.5mm;
      padding: 7mm;
      box-sizing: border-box;
      overflow: hidden;
      border-bottom: 1px dashed #9aab92;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .qr-print-tile:last-child { border-bottom: none; }
    .qr-print-tile .qr-print-sheet {
      padding: 3mm !important;
      width: 100%;
      transform: scale(0.92);
      transform-origin: center center;
    }
    .qr-print-tile .qr-print-sheet img { max-width: 52mm !important; }
    .qr-print-tile .qr-print-sheet h1 { font-size: 1.35rem !important; margin-top: 0.6rem !important; }
    .qr-print-tile .qr-print-sheet .mt-8 { margin-top: 0.6rem !important; }
    .qr-print-tile .qr-print-sheet .mt-6 { margin-top: 0.45rem !important; }
    .qr-print-tile .qr-print-sheet .mt-4 { margin-top: 0.35rem !important; }
    .qr-print-tile .qr-print-sheet .mt-3 { margin-top: 0.3rem !important; }
    .qr-print-tile .qr-print-sheet .pt-12 { padding-top: 0.5rem !important; }
    .qr-print-tile .safe-sign-html { font-size: 0.85rem !important; }
    .qr-print-tile .absolute.size-10,
    .qr-print-tile .absolute.size-12 { width: 1.5rem !important; height: 1.5rem !important; }
  `,
  quarter: `
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
      padding: 5mm;
      box-sizing: border-box;
      overflow: hidden;
      border-right: 1px dashed #9aab92;
      border-bottom: 1px dashed #9aab92;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .qr-print-tile:nth-child(2n) { border-right: none; }
    .qr-print-tile:nth-child(n+3) { border-bottom: none; }
    .qr-print-tile .qr-print-sheet {
      padding: 2mm !important;
      width: 100%;
      transform: scale(0.72);
      transform-origin: center center;
    }
    .qr-print-tile .qr-print-sheet img { max-width: 38mm !important; }
    .qr-print-tile .qr-print-sheet h1 { font-size: 1.05rem !important; margin-top: 0.4rem !important; }
    .qr-print-tile .qr-print-sheet .mt-8 { margin-top: 0.4rem !important; }
    .qr-print-tile .qr-print-sheet .mt-6 { margin-top: 0.3rem !important; }
    .qr-print-tile .qr-print-sheet .mt-4 { margin-top: 0.25rem !important; }
    .qr-print-tile .qr-print-sheet .mt-3 { margin-top: 0.2rem !important; }
    .qr-print-tile .qr-print-sheet .pt-12 { padding-top: 0.25rem !important; }
    .qr-print-tile .qr-print-sheet .text-xl { font-size: 0.85rem !important; }
    .qr-print-tile .qr-print-sheet .text-xs { font-size: 0.55rem !important; }
    .qr-print-tile .safe-sign-html { font-size: 0.7rem !important; }
    .qr-print-tile .absolute.size-10,
    .qr-print-tile .absolute.size-12 { width: 1.1rem !important; height: 1.1rem !important; }
  `,
};
