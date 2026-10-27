self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = event.notification.data && event.notification.data.url ? event.notification.data.url : "/app";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      const matchingClient = clients.find((client) => client.url.includes(targetUrl));
      if (matchingClient) {
        return matchingClient.focus();
      }
      return self.clients.openWindow(targetUrl);
    }),
  );
});
