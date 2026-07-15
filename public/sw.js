/* Stallside owner push service worker — push display only */

self.addEventListener("push", (event) => {
  let title = "Stallside";
  let body = "You have a new alert.";
  let data = {};
  try {
    const payload = event.data ? event.data.json() : {};
    title = payload.title || title;
    body = payload.body || body;
    data = payload.data || {};
  } catch {
    if (event.data) {
      body = event.data.text();
    }
  }

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      data,
      icon: "/brand/app-icon.png",
      badge: "/brand/app-icon.png",
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = "/dashboard";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if ("focus" in client && client.url.includes("/dashboard")) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(url);
      }
    }),
  );
});
