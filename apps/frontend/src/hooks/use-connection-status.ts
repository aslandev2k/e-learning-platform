import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

const TOAST_ID = 'connection-status';
const OFFLINE_DELAY_MS = 2000;

export function useConnectionStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    function onlineHandler() {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      setIsOnline(true);
      toast.success('Đã kết nối lại', { id: TOAST_ID, duration: 3000 });
    }

    function offlineHandler() {
      setIsOnline(false);
    }

    window.addEventListener('online', onlineHandler);
    window.addEventListener('offline', offlineHandler);

    return () => {
      window.removeEventListener('online', onlineHandler);
      window.removeEventListener('offline', offlineHandler);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (!isOnline) {
      timeoutRef.current = setTimeout(() => {
        if (!navigator.onLine) {
          toast.error('Bạn đang ngoại tuyến. Vui lòng kiểm tra kết nối mạng.', {
            id: TOAST_ID,
            duration: Number.POSITIVE_INFINITY,
            position: 'bottom-center',
            richColors: true,
          });
        }
      }, OFFLINE_DELAY_MS);
    }
  }, [isOnline]);

  return isOnline;
}
