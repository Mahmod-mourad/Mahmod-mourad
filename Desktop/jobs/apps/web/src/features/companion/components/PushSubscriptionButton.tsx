import { useState } from 'react';
import { useVapidPublicKey, useSubscribeToPush } from '../hooks/useCompanion';

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function PushSubscriptionButton() {
  const { data: vapidPublicKey } = useVapidPublicKey();
  const { mutate: subscribeToPush, isPending } = useSubscribeToPush();
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = async () => {
    if (!vapidPublicKey) return alert('Push notifications not configured on server.');
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      return alert('Push notifications are not supported in this browser.');
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        throw new Error('Permission not granted for Notification');
      }

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });

      const subData = subscription.toJSON();
      
      if (!subData.keys || !subData.endpoint) throw new Error('Invalid subscription generated');

      subscribeToPush(
        {
          endpoint: subData.endpoint,
          keys: {
            p256dh: subData.keys.p256dh!,
            auth: subData.keys.auth!,
          },
        },
        {
          onSuccess: () => setSubscribed(true),
          onError: () => alert('Failed to save subscription to server.'),
        }
      );
    } catch (error) {
      console.error(error);
      alert('Failed to subscribe to push notifications.');
    }
  };

  if (subscribed) {
    return <span className="text-green-600 text-sm font-medium">✓ Notifications Enabled</span>;
  }

  return (
    <button
      onClick={handleSubscribe}
      disabled={isPending || !vapidPublicKey}
      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 text-sm font-medium transition-colors"
    >
      {isPending ? 'Enabling...' : 'Enable Push Notifications'}
    </button>
  );
}
