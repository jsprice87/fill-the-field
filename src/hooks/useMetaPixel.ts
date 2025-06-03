
import { useEffect } from 'react';
import { useFranchiseeSettings } from './useFranchiseeSettings';

// Declare global fbq function
declare global {
  interface Window {
    fbq: any;
    _fbq: any;
  }
}

export const useMetaPixel = () => {
  const { data: settings } = useFranchiseeSettings();

  useEffect(() => {
    const metaPixelId = settings?.meta_pixel_id;
    
    if (!metaPixelId || typeof window === 'undefined') {
      return;
    }

    // Check if Meta Pixel is already loaded
    if (window.fbq) {
      return;
    }

    // Initialize Meta Pixel
    const initMetaPixel = () => {
      (function(f: any, b: any, e: any, v: any, n?: any, t?: any, s?: any) {
        if (f.fbq) return;
        n = f.fbq = function() {
          n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
        };
        if (!f._fbq) f._fbq = n;
        n.push = n;
        n.loaded = !0;
        n.version = '2.0';
        n.queue = [];
        t = b.createElement(e);
        t.async = !0;
        t.src = v;
        s = b.getElementsByTagName(e)[0];
        s.parentNode?.insertBefore(t, s);
      })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');

      window.fbq('init', metaPixelId);
      window.fbq('track', 'PageView');
    };

    initMetaPixel();

    // Cleanup function
    return () => {
      // Remove the script tag when component unmounts
      const scriptTag = document.querySelector('script[src*="fbevents.js"]');
      if (scriptTag) {
        scriptTag.remove();
      }
      // Reset fbq
      if (window.fbq) {
        delete window.fbq;
        delete window._fbq;
      }
    };
  }, [settings?.meta_pixel_id]);

  const trackEvent = (eventName: string, parameters?: any) => {
    if (window.fbq && settings?.meta_pixel_id) {
      window.fbq('track', eventName, parameters);
    }
  };

  return { trackEvent };
};
