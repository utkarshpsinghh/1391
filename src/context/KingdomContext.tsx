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

const STORAGE_KEY = 'k1391_kingdom_data_cache_v3';

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

    try {
      const url = `${endpoint}${endpoint.includes('?') ? '&' : '?'}t=${Date.now()}`;
      console.log('[Kingdom] Fetching live data from:', url);
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

        console.log('[Kingdom] Live data received successfully:', {
          alliances: liveData.alliances.length,
          team: liveData.team.length,
          kvkRecords: liveData.kvkRecords.length,
          news: liveData.news.length,
          faq: liveData.faq.length
        });

        setData(liveData);
        setError(null);

        if (liveData.alliances.length > 0) {
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(liveData));
          } catch (e) {
            console.warn('Unable to cache to localStorage', e);
          }
        }
      } else {
        const errMsg = json?.error || 'Invalid response from Google Sheets';
        console.error('[Kingdom] Error from script:', errMsg);
        setError(errMsg);
      }
    } catch (err) {
      console.error('[Kingdom] Failed to fetch Google Sheet data:', err);
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
