import React, { createContext, useContext, useEffect, useState } from 'react';
import { KingdomData, Alliance, emptyKingdomData, emptySettings } from '../data';
import { GOOGLE_APPS_SCRIPT_URL } from '../config';

interface KingdomContextType {
  data: KingdomData;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  getAlliance: (id?: string) => Alliance | undefined;
}

const STORAGE_KEY = 'k1391_kingdom_data_cache_v4';

const KingdomContext = createContext<KingdomContextType>({
  data: emptyKingdomData,
  loading: true,
  error: null,
  refresh: async () => {},
  getAlliance: () => undefined
});

// JSONP fallback to bypass any browser CORS / proxy / extension blocks
function fetchJsonp<T>(url: string, timeoutMs = 12000): Promise<T> {
  return new Promise((resolve, reject) => {
    const callbackName = 'kingdom_cb_' + Date.now() + '_' + Math.floor(Math.random() * 10000);
    const script = document.createElement('script');
    let timedOut = false;

    const timer = setTimeout(() => {
      timedOut = true;
      cleanup();
      reject(new Error('JSONP request timed out'));
    }, timeoutMs);

    const cleanup = () => {
      clearTimeout(timer);
      try {
        delete (window as any)[callbackName];
      } catch (e) {}
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };

    (window as any)[callbackName] = (response: T) => {
      if (timedOut) return;
      cleanup();
      resolve(response);
    };

    script.onerror = () => {
      if (timedOut) return;
      cleanup();
      reject(new Error('JSONP script load error'));
    };

    const separator = url.includes('?') ? '&' : '?';
    script.src = `${url}${separator}callback=${callbackName}`;
    document.head.appendChild(script);
  });
}

function sanitizeTimes(times: string[]): string[] {
  if (!Array.isArray(times)) return [];
  return times.map(t => {
    if (typeof t === 'string' && t.includes('1899')) {
      // Matches "19:00:00" or "19:00" in date strings
      const match = t.match(/(\d{2}:\d{2})/);
      if (match) return match[1];
    }
    return String(t || '').trim();
  }).filter(Boolean);
}

function sanitizeAlliances(list: any[]): Alliance[] {
  if (!Array.isArray(list)) return [];
  return list.map(a => ({
    id: String(a.id || '').toUpperCase(),
    name: a.name || `${a.id} Alliance`,
    description: a.description || '',
    playstyle: a.playstyle || 'Active',
    transferStatus: (a.transferStatus || 'OPEN').toUpperCase(),
    color: a.color || '#8b5128',
    crest: a.crest || '✦',
    events: {
      bear: sanitizeTimes(a.events?.bear),
      vikings: sanitizeTimes(a.events?.vikings),
      swordland: sanitizeTimes(a.events?.swordland),
      threeAlliance: sanitizeTimes(a.events?.threeAlliance)
    },
    contacts: Array.isArray(a.contacts) ? a.contacts : []
  }));
}

export const KingdomProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<KingdomData>(() => {
    try {
      const cached = localStorage.getItem(STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && Array.isArray(parsed.alliances) && parsed.alliances.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to parse cached kingdom data', e);
    }
    return emptyKingdomData;
  });

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    const endpoint = GOOGLE_APPS_SCRIPT_URL;
    setLoading(true);
    setError(null);

    const targetUrl = `${endpoint}${endpoint.includes('?') ? '&' : '?'}t=${Date.now()}`;
    let jsonResult: any = null;

    // 1. Try standard CORS fetch first
    try {
      console.log('[Kingdom] Attempting fetch to:', targetUrl);
      const res = await fetch(targetUrl, { method: 'GET' });
      jsonResult = await res.json();
    } catch (fetchErr) {
      console.warn('[Kingdom] Direct fetch failed, trying JSONP fallback:', fetchErr);
      // 2. Fall back to JSONP (works through all browser security / CORS restrictions)
      try {
        jsonResult = await fetchJsonp(targetUrl);
        console.log('[Kingdom] JSONP fallback succeeded!');
      } catch (jsonpErr) {
        console.error('[Kingdom] Both fetch and JSONP failed:', jsonpErr);
        setError('Could not connect to Google Sheets. Please check your internet or adblocker.');
        setLoading(false);
        return;
      }
    }

    if (jsonResult && jsonResult.ok && jsonResult.data) {
      const live = jsonResult.data;
      const liveData: KingdomData = {
        settings: {
          ...emptySettings,
          ...(live.settings || {})
        },
        alliances: sanitizeAlliances(live.alliances),
        team: Array.isArray(live.team) ? live.team : [],
        kvkRecords: Array.isArray(live.kvkRecords) ? live.kvkRecords : [],
        news: Array.isArray(live.news) ? live.news : [],
        faq: Array.isArray(live.faq) ? live.faq : []
      };

      console.log('[Kingdom] Live data loaded:', {
        alliances: liveData.alliances.length,
        team: liveData.team.length,
        records: liveData.kvkRecords.length
      });

      setData(liveData);
      setError(null);

      if (liveData.alliances.length > 0) {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(liveData));
        } catch (e) {}
      }
    } else {
      const msg = jsonResult?.error || 'Invalid response from Google Sheets';
      console.error('[Kingdom] Script returned error:', msg);
      setError(msg);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getAlliance = (id?: string): Alliance | undefined => {
    if (!id) return undefined;
    return data.alliances.find(a => a.id.toLowerCase() === id.trim().toLowerCase());
  };

  return (
    <KingdomContext.Provider value={{ data, loading, error, refresh: fetchData, getAlliance }}>
      {children}
    </KingdomContext.Provider>
  );
};

export const useKingdom = () => useContext(KingdomContext);
