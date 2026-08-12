export function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const output = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i += 1) {
    output[i] = raw.charCodeAt(i);
  }
  return output;
}

export async function waitForServiceWorker(reg: ServiceWorkerRegistration) {
  if (reg.active) return;
  const worker = reg.installing ?? reg.waiting;
  if (!worker) {
    await navigator.serviceWorker.ready;
    return;
  }
  await new Promise<void>((resolve) => {
    worker.addEventListener("statechange", () => {
      if (worker.state === "activated" || worker.state === "redundant") {
        resolve();
      }
    });
  });
}
