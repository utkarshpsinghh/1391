import React, { createContext, useContext, useEffect, useState } from 'react';
import { KingdomData, Alliance, emptyKingdomData, emptySettings } from '../data';

interface KingdomContextType {
  data: KingdomData;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  getAlliance: (id?: string) => Alliance | undefined;
}

const STORAGE_KEY = 'k1391_kingdom_data_cache_v2';

const KingdomContext = createContext<KingdomContextType>({
  data: emptyKingdomData,
  loading: true,
  error: null,
  refresh: async () => {},
  getAlliance: () => undefined
});

export const KingdomProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<KingdomData>(() => {
    try {
      const cached = localStorage.getItem(STORAGE_KEY);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (e) {
      console.warn('Failed to parse cached kingdom data', e);
    }
    return emptyKingdomData;
  });

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    const endpoint = import.meta.env.VITE_GOOGLE_APPS_SCRIPT_URL;
    if (!endpoint) {
      setError('VITE_GOOGLE_APPS_SCRIPT_URL is not configured.');
      setLoading(false);
      return;
    }

    try {
      const url = `${endpoint}${endpoint.includes('?') ? '&' : '?'}t=${Date.now()}`;
      const res = await fetch(url, { method: 'GET' });
      const json = await res.json();

      if (json && json.ok && json.data) {
        const live = json.data;
        const liveData: KingdomData = {
          settings: {
            ...emptySettings,
            ...(live.settings || {})
          },
          alliances: Array.isArray(live.alliances) ? live.alliances : [],
          team: Array.isArray(live.team) ? live.team : [],
          kvkRecords: Array.isArray(live.kvkRecords) ? live.kvkRecords : [],
          news: Array.isArray(live.news) ? live.news : [],
          faq: Array.isArray(live.faq) ? live.faq : []
        };

        setData(liveData);
        setError(null);
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(liveData));
        } catch (e) {
          console.warn('Unable to cache to localStorage', e);
        }
      } else {
        setError(json?.error || 'Failed to parse Google Sheets response.');
      }
    } catch (err) {
      console.warn('Could not fetch latest Google Sheet data:', err);
      setError('Could not reach Google Sheets. Please check your network or script deployment.');
    } finally {
      setLoading(false);
    }
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
