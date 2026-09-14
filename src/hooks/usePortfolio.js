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

  // Realtime: auto refresh ketika admin mengubah skills/projects/profile dll
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;
    // Supabase Realtime butuh replication enabled di dashboard untuk tiap tabel.
    let channel = null;
    try {
      channel = supabase
        .channel('portfolio-realtime')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'skills' }, () => fetchAll())
        .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, () => fetchAll())
        .on('postgres_changes', { event: '*', schema: 'public', table: 'profile' }, () => fetchAll())
        .on('postgres_changes', { event: '*', schema: 'public', table: 'experiences' }, () => fetchAll())
        .on('postgres_changes', { event: '*', schema: 'public', table: 'education' }, () => fetchAll())
        .on('postgres_changes', { event: '*', schema: 'public', table: 'site_settings' }, () => fetchAll())
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            // console.debug('[portfolio] realtime subscribed');
          }
        });
    } catch (e) {
      console.warn('[portfolio] realtime setup failed', e?.message);
    }
    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [fetchAll]);

  // Fallback polling gentle jika realtime tidak aktif (misal replication belum enabled)
  useEffect(() => {
    if (!isSupabaseConfigured) return;
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
