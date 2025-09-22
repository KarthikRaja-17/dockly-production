self.addEventListener('push', function (event) {
  const data = event.data?.json() || {};
  const {
    title = 'Dockly Alert',
    body = "You've got an update!",
    url = 'http://localhost:3000',
  } = data;

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: '/dockly.png',
      data: { url },
      requireInteraction: true, // optional: keeps the notification on screen
    })
  );
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  const url = event.notification.data?.url || 'http://localhost:3000';
  event.waitUntil(clients.openWindow(url));
});
