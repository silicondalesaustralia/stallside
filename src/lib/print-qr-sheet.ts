/** Print only the QR sign sheet in a blank popup so browser headers/footers stay empty. */
export function printQrSheet() {
  const sheet = document.querySelector(".qr-print-sheet");
  if (!sheet) {
    window.print();
    return;
  }

  const popup = window.open("", "_blank", "noopener,noreferrer,width=900,height=1200");
  if (!popup) {
    const previousTitle = document.title;
    document.title = "\u200B";
    window.addEventListener(
      "afterprint",
      () => {
        document.title = previousTitle;
      },
      { once: true },
    );
    window.print();
    return;
  }

  const rootClass = document.documentElement.className;
  const styles = Array.from(
    document.querySelectorAll('link[rel="stylesheet"], style'),
  )
    .map((node) => node.outerHTML)
    .join("\n");

  popup.document.open();
  popup.document.write(`<!DOCTYPE html>
<html class="${rootClass}">
<head>
<meta charset="utf-8" />
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
    padding: 14mm !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .qr-print-sheet {
    position: relative !important;
    overflow: hidden !important;
    border: none !important;
    border-radius: 0 !important;
    background: #fff !important;
    box-shadow: none !important;
    text-align: center;
    padding: 8mm !important;
  }
  .qr-print-sheet img {
    max-width: 90mm !important;
    height: auto !important;
  }
</style>
</head>
<body>${sheet.outerHTML}</body>
</html>`);
  popup.document.close();
  popup.document.title = "\u200B";

  const runPrint = () => {
    popup.focus();
    popup.print();
    popup.close();
  };

  const images = Array.from(popup.document.images);
  if (images.length === 0) {
    window.setTimeout(runPrint, 150);
    return;
  }

  let left = images.length;
  const done = () => {
    left -= 1;
    if (left <= 0) window.setTimeout(runPrint, 100);
  };
  for (const img of images) {
    if (img.complete) done();
    else {
      img.addEventListener("load", done, { once: true });
      img.addEventListener("error", done, { once: true });
    }
  }
}
