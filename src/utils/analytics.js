import ReactGA from "react-ga4";

export const initGA = () => {
  ReactGA.initialize("G-RTTTSRXX0R"); // Ganti dengan Measurement ID kamu
};

export const logPageView = () => {
  ReactGA.send({ hitType: "pageview", page: window.location.pathname });
};

export const trackSectionView = (sectionId) => {
  if (typeof window.gtag === 'function') {
    window.gtag('event', 'section_view', {
      section_id: sectionId,
    });
  }
};