const PRINT_ATTR = "data-collections-print";

export async function runCollectionPrint(
  printId: string,
  mode: "list" | "labels",
) {
  document
    .querySelectorAll(".is-print-target")
    .forEach((el) => el.classList.remove("is-print-target"));
  const selector =
    mode === "list"
      ? `.collections-print-list[data-print-id="${CSS.escape(printId)}"]`
      : `.collections-print-labels[data-print-id="${CSS.escape(printId)}"]`;
  const root = document.querySelector(selector);
  root?.classList.add("is-print-target");
  document.documentElement.setAttribute(PRINT_ATTR, mode);
  if (root) {
    const imgs = [...root.querySelectorAll("img")];
    await Promise.all(
      imgs.map((img) =>
        img.complete
          ? Promise.resolve()
          : new Promise<void>((resolve) => {
              img.addEventListener("load", () => resolve(), { once: true });
              img.addEventListener("error", () => resolve(), { once: true });
            }),
      ),
    );
  }
  window.print();
}

export function clearCollectionPrint() {
  document.documentElement.removeAttribute(PRINT_ATTR);
  document
    .querySelectorAll(".is-print-target")
    .forEach((el) => el.classList.remove("is-print-target"));
}
