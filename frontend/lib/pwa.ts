export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('SW registered:', registration);

          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  console.log('New service worker available');
                  showUpdateNotification(newWorker);
                }
              });
            }
          });

          checkForUpdates(registration);
        })
        .catch((error) => {
          console.log('SW registration failed:', error);
        });
    });

    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!refreshing) {
        window.location.reload();
        refreshing = true;
      }
    });

    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'SYNC_SUCCESS') {
        console.log('Background sync completed for:', event.data.url);
        showSyncSuccessNotification(event.data);
      }
    });
  }
}

function showUpdateNotification(newWorker: ServiceWorker) {
  const updateBanner = document.createElement('div');
  updateBanner.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #14b8a6;
    color: white;
    padding: 16px 24px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 10000;
    display: flex;
    align-items: center;
    gap: 12px;
    font-family: system-ui, -apple-system, sans-serif;
  `;
  
  updateBanner.innerHTML = `
    <span>New version available!</span>
    <button id="update-btn" style="background: white; color: #14b8a6; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; font-weight: 600;">
      Update
    </button>
    <button id="dismiss-btn" style="background: transparent; color: white; border: 1px solid white; padding: 8px 16px; border-radius: 4px; cursor: pointer;">
      Later
    </button>
  `;
  
  document.body.appendChild(updateBanner);
  
  document.getElementById('update-btn')?.addEventListener('click', () => {
    newWorker.postMessage({ type: 'SKIP_WAITING' });
    updateBanner.remove();
  });
  
  document.getElementById('dismiss-btn')?.addEventListener('click', () => {
    updateBanner.remove();
  });
  
  setTimeout(() => {
    updateBanner.remove();
  }, 30000);
}

function showSyncSuccessNotification(_data: { url?: string; type?: string }) {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: #10b981;
    color: white;
    padding: 12px 20px;
    border-radius: 6px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 10000;
    font-family: system-ui, -apple-system, sans-serif;
  `;
  
  notification.textContent = 'Your offline submission was sent successfully!';
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.remove();
  }, 5000);
}

function checkForUpdates(registration: ServiceWorkerRegistration) {
  setInterval(() => {
    registration.update();
  }, 60 * 60 * 1000);
}

export async function requestPushPermission(): Promise<PushSubscription | null> {
  if (!('Notification' in window) || !('PushManager' in window)) {
    console.log('Push notifications not supported');
    return null;
  }

  const permission = await Notification.requestPermission();
  
  if (permission !== 'granted') {
    console.log('Push notification permission denied');
    return null;
  }

  const registration = await navigator.serviceWorker.ready;
  
  try {
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(
        'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U'
      )
    });
    
    console.log('Push subscription created:', subscription);
    return subscription;
  } catch (error) {
    console.error('Failed to subscribe to push notifications:', error);
    return null;
  }
}

export async function subscribeToPushNotifications(endpoint: string = '/profile/subscribe_push') {
  const subscription = await requestPushPermission();
  
  if (!subscription) {
    return false;
  }

  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL || ''}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        subscription: subscription.toJSON()
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to save push subscription');
    }
    
    console.log('Push subscription saved to server');
    return true;
  } catch (error) {
    console.error('Failed to save push subscription:', error);
    return false;
  }
}

export async function unsubscribeFromPushNotifications(endpoint: string = '/profile/unsubscribe_push') {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    
    if (!subscription) {
      return true;
    }

    const response = await fetch(`${import.meta.env.VITE_API_URL || ''}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        endpoint: subscription.endpoint
      })
    });

    await subscription.unsubscribe();
    
    console.log('Push subscription removed');
    return true;
  } catch (error) {
    console.error('Failed to unsubscribe from push notifications:', error);
    return false;
  }
}

export async function getPendingSyncCount(): Promise<number> {
  if (!('serviceWorker' in navigator)) {
    return 0;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    
    return new Promise((resolve) => {
      const messageChannel = new MessageChannel();
      
      messageChannel.port1.onmessage = (event) => {
        if (event.data.type === 'PENDING_SYNCS') {
          resolve(event.data.count || 0);
        }
      };
      
      registration.active?.postMessage(
        { type: 'GET_PENDING_SYNCS' },
        [messageChannel.port2]
      );
      
      setTimeout(() => resolve(0), 1000);
    });
  } catch (error) {
    console.error('Failed to get pending sync count:', error);
    return 0;
  }
}

export async function clearAllCaches() {
  if (!('serviceWorker' in navigator)) {
    return;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    registration.active?.postMessage({ type: 'CLEAR_CACHE' });
    console.log('Cache cleared');
  } catch (error) {
    console.error('Failed to clear cache:', error);
  }
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

let deferredPrompt: any;

export function setupInstallPrompt() {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    
    const installButton = document.getElementById('install-pwa-button');
    if (installButton) {
      installButton.style.display = 'block';
    }
  });

  window.addEventListener('appinstalled', () => {
    console.log('PWA installed successfully');
    deferredPrompt = null;
  });
}

export function triggerInstallPrompt() {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choiceResult: any) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
      }
      deferredPrompt = null;
    });
  }
}
