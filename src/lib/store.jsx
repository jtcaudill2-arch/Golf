import React, { createContext, useContext, useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import { DEFAULT_CONFIG, LEGACY_RULES } from './defaults.js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const supabaseConfigured = Boolean(url && anonKey);
export const supabase = supabaseConfigured ? createClient(url, anonKey) : null;

const StoreContext = createContext(null);

export function StoreProvider({ children }) {
  const [config, setConfig] = useState(null);
  const [scores, setScores] = useState({}); // scores[round][entity][hole] = strokes
  const [status, setStatus] = useState('connecting'); // connecting | live | error
  const [syncError, setSyncError] = useState(false); // a write failed and state may not be persisted
  const configRef = useRef(config);
  configRef.current = config;

  // Realtime events that arrive before the initial snapshot commits are
  // buffered and replayed after it, so the (older) snapshot can never
  // clobber a newer event — and a lone config event can't create a partial
  // config that slips past the loading gate.
  const loadedRef = useRef(false);
  const pendingRef = useRef({ config: [], scores: [] });

  const flagWrite = useCallback(({ error }) => {
    if (error) {
      console.error('write failed', error);
      setSyncError(true);
    } else {
      setSyncError(false);
    }
    return { error };
  }, []);

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
          flagWrite(await supabase.from('config').upsert(rows, { ignoreDuplicates: true }));
          for (const k of missing) cfg[k] = DEFAULT_CONFIG[k];
        }

        // One-time upgrades for databases seeded from older defaults.
        const upgrades = [];
        if (cfg.courses && (cfg.courses.version || 0) < DEFAULT_CONFIG.courses.version) {
          cfg.courses = mergeCourses(DEFAULT_CONFIG.courses, cfg.courses);
          upgrades.push({ key: 'courses', value: cfg.courses });
        }
        if (cfg.rules === LEGACY_RULES) {
          cfg.rules = DEFAULT_CONFIG.rules;
          upgrades.push({ key: 'rules', value: cfg.rules });
        }
        if (upgrades.length) flagWrite(await supabase.from('config').upsert(upgrades));

        const sc = {};
        for (const row of scoreRes.data) {
          if (row.strokes == null) continue;
          ((sc[row.round_id] ??= {})[row.entity_id] ??= {})[row.hole] = row.strokes;
        }

        // Commit the snapshot, then replay anything realtime delivered while
        // we were loading (those events are newer than the snapshot).
        for (const row of pendingRef.current.config) cfg[row.key] = row.value;
        let merged = sc;
        for (const ev of pendingRef.current.scores) {
          merged = applyScore(merged, ev.round, ev.entity, ev.hole, ev.strokes);
        }
        pendingRef.current = { config: [], scores: [] };
        loadedRef.current = true;
        setConfig(cfg);
        setScores(merged);
        setStatus('live');
      } catch (e) {
        console.error('Supabase load failed', e);
        if (!cancelled) setStatus('error');
      }
    })();
    return () => { cancelled = true; };
  }, [flagWrite]);

  // Realtime: apply every remote change to local state.
  useEffect(() => {
    if (!supabase) return;
    const channel = supabase
      .channel('golf-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'config' }, (payload) => {
        const row = payload.new;
        if (!row?.key) return;
        if (!loadedRef.current) {
          pendingRef.current.config.push(row);
          return;
        }
        setConfig((c) => ({ ...(c || {}), [row.key]: row.value }));
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'scores' }, (payload) => {
        const row = payload.eventType === 'DELETE' ? payload.old : payload.new;
        if (!row) return;
        const ev = {
          round: row.round_id, entity: row.entity_id, hole: row.hole,
          strokes: payload.eventType === 'DELETE' ? null : row.strokes,
        };
        if (!loadedRef.current) {
          pendingRef.current.scores.push(ev);
          return;
        }
        setScores((s) => applyScore(s, ev.round, ev.entity, ev.hole, ev.strokes));
      })
      .subscribe((state) => {
        // Never mask a load failure — the error screen must stay up.
        if (state === 'SUBSCRIBED') setStatus((s) => (s === 'error' ? s : 'live'));
      });
    return () => { supabase.removeChannel(channel); };
  }, []);

  // Per-key write queues: corrections to the same hole (or key) are
  // serialized so they can't commit out of order server-side.
  const queuesRef = useRef({});
  const enqueue = useCallback((key, job) => {
    const q = (queuesRef.current[key] || Promise.resolve()).then(job).catch(() => {});
    queuesRef.current[key] = q;
    return q;
  }, []);

  const setConfigKey = useCallback((key, valueOrFn) => {
    // Compute outside the updater (React may re-invoke updaters), then write.
    const prev = configRef.current?.[key];
    const value = typeof valueOrFn === 'function' ? valueOrFn(prev) : valueOrFn;
    setConfig((c) => ({ ...(c || {}), [key]: value }));
    enqueue(`config:${key}`, async () =>
      flagWrite(await supabase.from('config').upsert({ key, value, updated_at: new Date().toISOString() }))
    );
  }, [enqueue, flagWrite]);

  const setScore = useCallback((round, entity, hole, strokes) => {
    setScores((s) => applyScore(s, round, entity, hole, strokes));
    enqueue(`score:${round}:${entity}:${hole}`, async () =>
      flagWrite(
        strokes == null
          ? await supabase.from('scores').delete().match({ round_id: round, entity_id: entity, hole })
          : await supabase.from('scores').upsert({ round_id: round, entity_id: entity, hole, strokes, updated_at: new Date().toISOString() })
      )
    );
  }, [enqueue, flagWrite]);

  const resetScores = useCallback(async (round) => {
    setScores((s) => {
      if (round == null) return {};
      const next = { ...s };
      delete next[round];
      return next;
    });
    const q = supabase.from('scores').delete();
    const res = round == null ? await q.gte('round_id', 0) : await q.eq('round_id', round);
    flagWrite(res);
    if (res.error) window.alert('Reset failed to reach the database — check your connection and try again.');
  }, [flagWrite]);

  const value = useMemo(
    () => ({ config, scores, status, syncError, setConfigKey, setScore, resetScores }),
    [config, scores, status, syncError, setConfigKey, setScore, resetScores]
  );
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

// Course-config upgrade that keeps what users typed in on site. New defaults
// win for the data a version bump ships (par, stroke index, and yardages for
// tees the defaults define); user-entered extras survive: tee display names,
// selected tees, and yardages for tees the defaults leave blank.
function mergeCourses(defaults, old) {
  const next = JSON.parse(JSON.stringify(defaults));
  const mergeHoles = (defHoles, oldHoles) => {
    if (!Array.isArray(oldHoles)) return;
    defHoles.forEach((h, i) => {
      const oldYds = oldHoles[i]?.yds;
      if (oldYds && typeof oldYds === 'object') h.yds = { ...oldYds, ...h.yds };
    });
  };
  const mergeTees = (course, oldCourse) => {
    if (!oldCourse) return;
    if (oldCourse.selectedTee && course.tees?.some((t) => t.id === oldCourse.selectedTee)) {
      course.selectedTee = oldCourse.selectedTee;
    }
    course.tees?.forEach((t) => {
      const oldTee = oldCourse.tees?.find((o) => o.id === t.id);
      if (oldTee?.name) t.name = oldTee.name;
    });
  };
  mergeTees(next.paako, old.paako);
  mergeTees(next.blackmesa, old.blackmesa);
  for (const nid of Object.keys(next.paako.nines)) {
    mergeHoles(next.paako.nines[nid].holes, old.paako?.nines?.[nid]?.holes);
  }
  mergeHoles(next.blackmesa.holes, old.blackmesa?.holes);
  return next;
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
