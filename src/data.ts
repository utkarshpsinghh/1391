import { KingdomData, Alliance, KingdomSettings } from './types';

export * from './types';

export const emptySettings: KingdomSettings = {
  kingdomNumber: '1391',
  kingdomName: 'KINGSHOT KINGDOM 1391',
  discordUrl: '',
  heroTitle: '',
  heroSubtitle: '',
  heroCopy: ''
};

export const emptyKingdomData: KingdomData = {
  settings: emptySettings,
  alliances: [],
  team: [],
  kvkRecords: [],
  news: [],
  faq: []
};

// Aliases for compatibility
export const defaultKingdomData = emptyKingdomData;
export const alliances: Alliance[] = [];
export const byId = (id?: string) => undefined;