export const trackSectionView = (sectionId) => {
  if (typeof window.gtag === 'function') {
    window.gtag('event', 'section_view', {
      section_id: sectionId,
    });
  }
};