export function loadGA(measurementId) {
  if (!measurementId) return;
  // Validate measurementId format G-XXXXXXXXXX
  if (!/^G-[A-Z0-9]{6,20}$/.test(measurementId)) {
    console.warn('[ga] Measurement ID tidak valid, skip load');
    return;
  }

  const existing = document.querySelector(`script[data-gtm-id="${measurementId}"]`);
  if (existing) return;

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  script.setAttribute('data-gtm-id', measurementId);
  document.head.appendChild(script);

  const inline = document.createElement('script');
  // Use textContent instead of innerHTML to avoid XSS if measurementId ever attacker-controlled
  inline.textContent = `window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', '${measurementId}');`;
  document.head.appendChild(inline);
}
