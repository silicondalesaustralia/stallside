import { QR_PRINT_SIZE_CSS, type QrPrintSize } from "@/lib/qr-print-size-css";

export type { QrPrintSize };
export const QR_PRINT_SIZES: { id: QrPrintSize; label: string; hint: string }[] = [
  { id: "a4", label: "A4", hint: "Full page" },
  { id: "half", label: "Half A4", hint: "2 per page" },
  { id: "quarter", label: "Quarter A4", hint: "4 per page" },
];

const COPIES: Record<QrPrintSize, number> = {
  a4: 1,
  half: 2,
  quarter: 4,
};

function absoluteUrl(href: string): string {
  try {
    return new URL(href, window.location.origin).href;
  } catch {
    return href;
  }
}

/** Rewrite relative src/href so assets resolve from about:blank. */
function absolutizeHtml(html: string): string {
  return html
    .replace(
      /\b(src|href)=("|\')(?!https?:|data:|blob:|\/\/)([^"']+)\2/gi,
      (_m, attr: string, quote: string, path: string) =>
        `${attr}=${quote}${absoluteUrl(path)}${quote}`,
    );
}

/** Print only the QR sign sheet in a blank popup so browser headers/footers stay empty. */
export function printQrSheet(size: QrPrintSize = "a4") {
  const sheet = document.querySelector(".qr-print-sheet");
  if (!sheet) {
    window.print();
    return;
  }

  const tiles = Array.from({ length: COPIES[size] }, () => {
    const clone = sheet.cloneNode(true) as HTMLElement;
    if (size !== "a4") clone.classList.add("qr-print-sheet--compact");
    else clone.classList.remove("qr-print-sheet--compact");
    if (size === "quarter") clone.classList.add("qr-print-sheet--quarter");
    else clone.classList.remove("qr-print-sheet--quarter");
    if (size === "half") clone.classList.add("qr-print-sheet--half");
    else clone.classList.remove("qr-print-sheet--half");
    return `<div class="qr-print-tile">${clone.outerHTML}</div>`;
  }).join("");

  // Do not use noopener/noreferrer — both make window.open() return null in Chromium,
  // which falls back to printing this page (preview is print:hidden → blank sheet).
  const popup = window.open("", "_blank", "width=900,height=1200");
  if (!popup) {
    window.alert("Allow pop-ups for this site to print the QR sign.");
    return;
  }
  popup.opener = null;

  const rootClass = document.documentElement.className;
  const styles = Array.from(
    document.querySelectorAll('link[rel="stylesheet"], style'),
  )
    .map((node) => {
      if (node instanceof HTMLLinkElement && node.href) {
        const link = node.cloneNode(true) as HTMLLinkElement;
        link.href = absoluteUrl(node.getAttribute("href") || node.href);
        return link.outerHTML;
      }
      return node.outerHTML;
    })
    .join("\n");

  popup.document.open();
  popup.document.write(`<!DOCTYPE html>
<html class="${rootClass}">
<head>
<meta charset="utf-8" />
<base href="${window.location.origin}/" />
<title>\u200B</title>
${styles}
<style>
  @page { size: A4; margin: 0; }
  html, body {
    margin: 0 !important;
    padding: 0 !important;
    background: #fff !important;
    color: #182c1b !important;
  }
  body {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .qr-print-sheet {
    position: relative !important;
    border: none !important;
    border-radius: 0 !important;
    background: #fff !important;
    box-shadow: none !important;
  }
  ${QR_PRINT_SIZE_CSS[size]}
</style>
</head>
<body>
  <div class="qr-print-layout">${absolutizeHtml(tiles)}</div>
</body>
</html>`);
  popup.document.close();
  popup.document.title = "\u200B";

  const runPrint = () => {
    try {
      popup.focus();
      popup.print();
    } finally {
      // Close after the print dialog is dismissed when possible.
      window.setTimeout(() => {
        try {
          popup.close();
        } catch {
          // Ignore if already closed.
        }
      }, 250);
    }
  };

  const images = Array.from(popup.document.images);
  if (images.length === 0) {
    window.setTimeout(runPrint, 200);
    return;
  }

  let left = images.length;
  const done = () => {
    left -= 1;
    if (left <= 0) window.setTimeout(runPrint, 150);
  };
  for (const img of images) {
    if (img.complete && img.naturalWidth > 0) done();
    else {
      img.addEventListener("load", done, { once: true });
      img.addEventListener("error", done, { once: true });
    }
  }
}
