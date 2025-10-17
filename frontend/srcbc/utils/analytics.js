let initialized = false;

export function initAnalytics() {
  if (initialized) return;
  const provider = (process.env.REACT_APP_ANALYTICS_PROVIDER || 'ga4').toLowerCase();

  if (provider === 'plausible') {
    const domain = process.env.REACT_APP_PLAUSIBLE_DOMAIN;
    const scriptSrc = process.env.REACT_APP_PLAUSIBLE_SCRIPT_URL || 'https://plausible.io/js/plausible.js';
    if (!domain) { initialized = true; return; }
    const script = document.createElement('script');
    script.async = true;
    script.defer = true;
    script.setAttribute('data-domain', domain);
    script.src = scriptSrc;
    document.head.appendChild(script);
    initialized = true;
    return;
  }

  if (provider === 'umami') {
    const websiteId = process.env.REACT_APP_UMAMI_WEBSITE_ID;
    const scriptSrc = process.env.REACT_APP_UMAMI_SCRIPT_URL; // e.g., https://umami.example.com/script.js
    if (!websiteId || !scriptSrc) { initialized = true; return; }
    const script = document.createElement('script');
    script.async = true;
    script.src = scriptSrc;
    script.setAttribute('data-website-id', websiteId);
    document.head.appendChild(script);
    initialized = true;
    return;
  }

  // Default: GA4
  const GA_ID = process.env.REACT_APP_GA_ID;
  if (!GA_ID) { initialized = true; return; }
  const scriptTag = document.createElement('script');
  scriptTag.async = true;
  scriptTag.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(scriptTag);
  window.dataLayer = window.dataLayer || [];
  function gtag(){window.dataLayer.push(arguments);} // eslint-disable-line
  gtag('js', new Date());
  gtag('config', GA_ID);
  initialized = true;
}

export function trackPageview(pathname) {
  const provider = (process.env.REACT_APP_ANALYTICS_PROVIDER || 'ga4').toLowerCase();

  if (provider === 'plausible') {
    if (typeof window.plausible === 'function') {
      // SPA route change pageview
      window.plausible('pageview', { u: pathname });
    }
    return;
  }

  if (provider === 'umami') {
    if (window.umami && typeof window.umami.trackView === 'function') {
      window.umami.trackView(pathname);
    } else if (window.umami && typeof window.umami.track === 'function') {
      window.umami.track('pageview', { url: pathname });
    }
    return;
  }

  const GA_ID = process.env.REACT_APP_GA_ID;
  if (!GA_ID || !window.dataLayer) return;
  window.dataLayer.push({
    event: 'page_view',
    page_path: pathname,
  });
}