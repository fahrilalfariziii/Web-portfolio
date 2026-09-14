import { useCallback, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
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
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [usingFallback, setUsingFallback] = useState(!isSupabaseConfigured);
  const [error, setError] = useState(null);

  const fetchAll = useCallback(async () => {
    if (!isSupabaseConfigured || !supabase) {
      setData(initialState);
      setUsingFallback(true);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [profileRes, eduRes, expRes, skillRes, projRes, settingsRes] = await Promise.all([
        supabase.from('profile').select('*').order('id', { ascending: true }).limit(1).maybeSingle(),
        supabase.from('education').select('*').order('sort_order', { ascending: true }),
        supabase.from('experiences').select('*').order('sort_order', { ascending: true }),
        supabase.from('skills').select('*').order('sort_order', { ascending: true }),
        supabase.from('projects').select('*').order('sort_order', { ascending: true }),
        supabase.from('site_settings').select('*').order('id', { ascending: true }).limit(1).maybeSingle(),
      ]);

      const firstError =
        profileRes.error || eduRes.error || expRes.error || skillRes.error || projRes.error || settingsRes.error;
      // Jika tabel belum dibuat (seed belum jalan), fallback agar landing tetap tampil.
      if (firstError) throw firstError;

      setData({
        profile: profileRes.data
          ? {
              ...fallbackProfile,
              ...profileRes.data,
              socials: profileRes.data.socials || fallbackProfile.socials,
            }
          : fallbackProfile,
        education: eduRes.data?.length ? eduRes.data : fallbackEducation,
        experiences: expRes.data?.length ? expRes.data : fallbackExperiences,
        skills: skillRes.data?.length ? skillRes.data : fallbackSkills,
        projects: projRes.data?.length ? projRes.data : fallbackProjects,
        siteSettings: settingsRes.data
          ? { ...fallbackSiteSettings, ...settingsRes.data }
          : fallbackSiteSettings,
      });
      setUsingFallback(false);
    } catch (e) {
      console.warn('[portfolio] Supabase fetch gagal, pakai fallback lokal:', e?.message);
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

  return { ...data, loading, usingFallback, error, refresh: fetchAll };
}
