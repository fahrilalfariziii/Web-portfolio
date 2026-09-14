export function loadGA(measurementId) {
  if (!measurementId) return;
  // Validate measurementId format G-XXXXXXXXXX
  if (!/^G-[A-Z0-9]{6,20}$/.test(measurementId)) {
    console.warn('[ga] Measurement ID tidak valid, skip load');
    return;
  }

  const existing = document.querySelector(`script[data-gtm-id="${measurementId}"]`);
  if (existing) return;

  // Load gtag.js external script - allowed by CSP script-src https://www.googletagmanager.com
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  script.setAttribute('data-gtm-id', measurementId);
  document.head.appendChild(script);

  // Initialize dataLayer/gtag WITHOUT creating an inline <script> element
  // Direct JS execution is not blocked by CSP script-src (only inline <script> blocks are)
  window.dataLayer = window.dataLayer || [];
  if (typeof window.gtag !== 'function') {
    window.gtag = function gtag() {
      window.dataLayer.push(arguments);
    };
  }
  window.gtag('js', new Date());
  window.gtag('config', measurementId);
}
