export function loadGA(measurementId) {
  if (!measurementId) return;

  // create script tag to load gtag.js
  const existing = document.querySelector(`script[data-gtm-id="${measurementId}"]`);
  if (existing) return;

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  script.setAttribute('data-gtm-id', measurementId);
  document.head.appendChild(script);

  const inline = document.createElement('script');
  inline.innerHTML = `window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', '${measurementId}');`;
  document.head.appendChild(inline);
}
