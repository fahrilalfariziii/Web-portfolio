import { useCallback, useEffect, useState } from 'react';
import { fetchPortfolio } from '../lib/apiClient';
import {
  fallbackEducation,
  fallbackExperiences,
  fallbackProfile,
  fallbackProjects,
  fallbackSiteSettings,
  fallbackSkills,
} from '../data/fallback';

const initialState = {
  profile: fallbackProfile,
  education: fallbackEducation,
  experiences: fallbackExperiences,
  skills: fallbackSkills,
  projects: fallbackProjects,
  siteSettings: fallbackSiteSettings,
};

export function usePortfolio() {
  const [data, setData] = useState(initialState);
  const [loading, setLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);
  const [error, setError] = useState(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchPortfolio();
      // Server returns { profile, education, experiences, skills, projects, siteSettings }
      // Normalize to fallback semantics
      const profile = res.profile
        ? { ...fallbackProfile, ...res.profile, socials: res.profile.socials || fallbackProfile.socials }
        : fallbackProfile;
      const education = res.education?.length ? res.education : fallbackEducation;
      const experiences = res.experiences?.length ? res.experiences : fallbackExperiences;
      const skills = res.skills?.length ? res.skills : fallbackSkills;
      const projects = res.projects?.length ? res.projects : fallbackProjects;
      const siteSettings = res.siteSettings ? { ...fallbackSiteSettings, ...res.siteSettings } : fallbackSiteSettings;

      setData({ profile, education, experiences, skills, projects, siteSettings });
      // If server returned empty arrays but fallback used, still mark as fallback
      const isFallback = !res.skills?.length && !res.projects?.length;
      setUsingFallback(isFallback);
    } catch (e) {
      console.warn('[portfolio] fetch failed, pakai fallback lokal:', e?.message);
      setData(initialState);
      setUsingFallback(true);
      setError(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // Poll on focus/visibility - realtime via server could be added via SSE/WebSocket later
  useEffect(() => {
    const onFocus = () => fetchAll();
    const onVisible = () => { if (document.visibilityState === 'visible') fetchAll(); };
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [fetchAll]);

  return { ...data, loading, usingFallback, error, refresh: fetchAll };
}
