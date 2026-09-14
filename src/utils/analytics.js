import ReactGA from "react-ga4";

const GA_ID = import.meta.env.VITE_GA_ID;

export const initGA = () => {
  if (!GA_ID || !/^G-[A-Z0-9]{6,20}$/.test(GA_ID)) return;
  // ReactGA will inject gtag script itself; if loadGA already did, it will be deduped
  ReactGA.initialize(GA_ID);
};

export const logPageView = () => {
  if (!GA_ID) return;
  ReactGA.send({ hitType: "pageview", page: window.location.pathname });
};

export const trackSectionView = (sectionId) => {
  if (typeof window.gtag === 'function') {
    window.gtag('event', 'section_view', {
      section_id: sectionId,
    });
  }
};
