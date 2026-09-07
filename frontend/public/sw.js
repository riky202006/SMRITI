// ==============================================================================
// SMRITI SERVICE WORKER (Web Push & Emergency SOS Handler)
// ==============================================================================

self.addEventListener('install', (event) => {
  // Activate immediately without waiting
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Claim all active clients immediately
  event.waitUntil(self.clients.claim());
});

// -----------------------------------------------------------------------------
// PUSH NOTIFICATION EVENT LISTENER
// -----------------------------------------------------------------------------
self.addEventListener('push', (event) => {
  let data = {};

  if (event.data) {
    try {
      data = event.data.json();
    } catch {
      data = {
        title: '🚨 EMERGENCY SOS ALERT',
        body: event.data.text() || 'Patient distress signal received.',
      };
    }
  } else {
    data = {
      title: '🚨 EMERGENCY SOS ALERT',
      body: 'Patient distress signal received. Please check immediately.',
    };
  }

  const title = data.title || '🚨 EMERGENCY SOS ALERT';
  const options = {
    body: data.body || 'Your monitored patient has triggered an emergency distress signal!',
    icon: data.icon || '/favicon.svg',
    badge: data.badge || '/favicon.svg',
    tag: 'smriti-sos-alert',
    renotify: true,
    requireInteraction: true,
    vibrate: [300, 100, 300, 100, 300, 100, 500],
    data: {
      url: data.data?.url || data.url || '/caretaker/sos',
      alertId: data.data?.alertId || null,
      timestamp: Date.now(),
    },
    actions: [
      {
        action: 'open_sos',
        title: '🚨 Open SOS Monitor',
      },
    ],
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// -----------------------------------------------------------------------------
// NOTIFICATION CLICK EVENT LISTENER
// -----------------------------------------------------------------------------
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const targetUrl = event.notification.data?.url || '/caretaker/sos';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If a SMRITI tab is already open, focus it and navigate to the SOS monitor
      for (const client of clientList) {
        if ('focus' in client) {
          client.focus();
          if ('navigate' in client && !client.url.includes('/caretaker/sos')) {
            client.navigate(targetUrl);
          }
          return;
        }
      }

      // Otherwise open a new browser window/tab
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});
