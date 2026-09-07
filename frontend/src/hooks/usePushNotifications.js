import { useState, useEffect, useCallback } from 'react';
import {
  isPushNotificationSupported,
  getExistingPushSubscription,
  subscribeCaregiverDevice,
  unsubscribeCaregiverDevice,
  registerServiceWorker,
} from '@/services/pushNotifications';

export function usePushNotifications(caretakerId) {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const checkStatus = useCallback(async () => {
    const supported = isPushNotificationSupported();
    setIsSupported(supported);

    if (!supported) {
      setLoading(false);
      return;
    }

    setPermission(Notification.permission);

    try {
      await registerServiceWorker();
      const subscription = await getExistingPushSubscription();
      setIsSubscribed(Boolean(subscription));
    } catch (err) {
      console.warn('[usePushNotifications] Failed to check status:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  const subscribe = async () => {
    if (!caretakerId) {
      const err = new Error('Caretaker ID is missing');
      setError(err);
      return { success: false, error: err };
    }

    setLoading(true);
    setError(null);

    const res = await subscribeCaregiverDevice(caretakerId);
    if (res.success) {
      setIsSubscribed(true);
      setPermission('granted');
    } else {
      setError(res.error);
    }
    setLoading(false);
    return res;
  };

  const unsubscribe = async () => {
    setLoading(true);
    setError(null);

    const res = await unsubscribeCaregiverDevice(caretakerId);
    if (res.success) {
      setIsSubscribed(false);
    } else {
      setError(res.error);
    }
    setLoading(false);
    return res;
  };

  return {
    isSupported,
    permission,
    isSubscribed,
    loading,
    error,
    subscribe,
    unsubscribe,
    refreshStatus: checkStatus,
  };
}
