import React, { createContext, useContext, useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import { DEFAULT_CONFIG } from './defaults.js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const supabaseConfigured = Boolean(url && anonKey);
export const supabase = supabaseConfigured ? createClient(url, anonKey) : null;

const StoreContext = createContext(null);

export function StoreProvider({ children }) {
  const [config, setConfig] = useState(null);
  const [scores, setScores] = useState({}); // scores[round][entity][hole] = strokes
  const [status, setStatus] = useState('connecting'); // connecting | live | error
  const configRef = useRef(config);
  configRef.current = config;

  // Initial load + seed any missing config keys with defaults.
  useEffect(() => {
    if (!supabase) return;
    let cancelled = false;
    (async () => {
      try {
        const [cfgRes, scoreRes] = await Promise.all([
          supabase.from('config').select('key, value'),
          supabase.from('scores').select('round_id, entity_id, hole, strokes'),
        ]);
        if (cfgRes.error) throw cfgRes.error;
        if (scoreRes.error) throw scoreRes.error;
        if (cancelled) return;

        const cfg = {};
        for (const row of cfgRes.data) cfg[row.key] = row.value;
        const missing = Object.keys(DEFAULT_CONFIG).filter((k) => !(k in cfg));
        if (missing.length) {
          const rows = missing.map((k) => ({ key: k, value: DEFAULT_CONFIG[k] }));
          await supabase.from('config').upsert(rows, { ignoreDuplicates: true });
          for (const k of missing) cfg[k] = DEFAULT_CONFIG[k];
        }
        setConfig(cfg);

        const sc = {};
        for (const row of scoreRes.data) {
          if (row.strokes == null) continue;
          ((sc[row.round_id] ??= {})[row.entity_id] ??= {})[row.hole] = row.strokes;
        }
        setScores(sc);
        setStatus('live');
      } catch (e) {
        console.error('Supabase load failed', e);
        if (!cancelled) setStatus('error');
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Realtime: apply every remote change to local state.
  useEffect(() => {
    if (!supabase) return;
    const channel = supabase
      .channel('golf-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'config' }, (payload) => {
        const row = payload.new;
        if (!row?.key) return;
        setConfig((c) => ({ ...(c || {}), [row.key]: row.value }));
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'scores' }, (payload) => {
        const row = payload.eventType === 'DELETE' ? payload.old : payload.new;
        if (!row) return;
        const strokes = payload.eventType === 'DELETE' ? null : row.strokes;
        setScores((s) => applyScore(s, row.round_id, row.entity_id, row.hole, strokes));
      })
      .subscribe((state) => {
        if (state === 'SUBSCRIBED') setStatus('live');
      });
    return () => { supabase.removeChannel(channel); };
  }, []);

  const setConfigKey = useCallback((key, valueOrFn) => {
    setConfig((c) => {
      const prev = c?.[key];
      const value = typeof valueOrFn === 'function' ? valueOrFn(prev) : valueOrFn;
      supabase?.from('config').upsert({ key, value, updated_at: new Date().toISOString() })
        .then(({ error }) => { if (error) console.error('config save failed', error); });
      return { ...(c || {}), [key]: value };
    });
  }, []);

  const setScore = useCallback((round, entity, hole, strokes) => {
    setScores((s) => applyScore(s, round, entity, hole, strokes));
    const write = strokes == null
      ? supabase?.from('scores').delete().match({ round_id: round, entity_id: entity, hole })
      : supabase?.from('scores').upsert({ round_id: round, entity_id: entity, hole, strokes, updated_at: new Date().toISOString() });
    write?.then(({ error }) => { if (error) console.error('score save failed', error); });
  }, []);

  const resetScores = useCallback(async (round) => {
    setScores((s) => {
      if (round == null) return {};
      const next = { ...s };
      delete next[round];
      return next;
    });
    const q = supabase?.from('scores').delete();
    if (round == null) await q?.gte('round_id', 0);
    else await q?.eq('round_id', round);
  }, []);

  const value = useMemo(
    () => ({ config, scores, status, setConfigKey, setScore, resetScores }),
    [config, scores, status, setConfigKey, setScore, resetScores]
  );
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

function applyScore(s, round, entity, hole, strokes) {
  const next = { ...s, [round]: { ...(s[round] || {}) } };
  next[round][entity] = { ...(next[round][entity] || {}) };
  if (strokes == null) delete next[round][entity][hole];
  else next[round][entity][hole] = strokes;
  return next;
}

export function useStore() {
  return useContext(StoreContext);
}

// Which player is using this phone (identity only — stored locally).
export function useIdentity() {
  const [me, setMeState] = useState(() => localStorage.getItem('golf-me') || null);
  const setMe = (id) => {
    if (id == null) localStorage.removeItem('golf-me');
    else localStorage.setItem('golf-me', id);
    setMeState(id);
  };
  return [me, setMe];
}
