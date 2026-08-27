import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const GA_MEASUREMENT_ID = 'G-KQCGM6MH2M';

export default function GoogleAnalytics() {
  const location = useLocation();

  useEffect(() => {
    // Exclude all admin routes from Google Analytics tracking
    const isAdminRoute = location.pathname.startsWith('/admin');

    if (isAdminRoute) {
      return;
    }

    // Dynamically inject Google Analytics (gtag.js) script if not already present
    if (!document.getElementById('ga-gtag-script')) {
      const script1 = document.createElement('script');
      script1.id = 'ga-gtag-script';
      script1.async = true;
      script1.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
      document.head.appendChild(script1);

      const script2 = document.createElement('script');
      script2.id = 'ga-gtag-init';
      script2.innerHTML = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        window.gtag = gtag;
        gtag('js', new Date());
        gtag('config', '${GA_MEASUREMENT_ID}', { send_page_view: false });
      `;
      document.head.appendChild(script2);
    }

    // Send pageview event for public routes on route change
    if (window.gtag) {
      window.gtag('config', GA_MEASUREMENT_ID, {
        page_path: location.pathname + location.search,
        page_title: document.title
      });
    }
  }, [location]);

  return null;
}
