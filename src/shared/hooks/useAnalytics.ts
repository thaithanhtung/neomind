import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView } from '../utils/analytics';
import { stateChange } from '../utils/hotjar';

/**
 * Hook để tự động track page views khi route thay đổi
 */
export const useAnalytics = () => {
  const location = useLocation();

  useEffect(() => {
    // Track page view mỗi khi route thay đổi
    trackPageView(location.pathname + location.search);

    // Track state change cho Hotjar (SPA navigation)
    stateChange(location.pathname + location.search);
  }, [location]);
};
