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

export const initialLeaderboard = [
  // Alliance Categories
  { category: 'Alliance Power', rank: 1, playerName: 'OneForAll', alliance: 'HOT', scoreValue: '18.4B', scoreLabel: 'Alliance Power' },
  { category: 'Alliance Power', rank: 2, playerName: 'NastyAzzTroops', alliance: 'NAT', scoreValue: '16.9B', scoreLabel: 'Alliance Power' },
  { category: 'Alliance Power', rank: 3, playerName: 'VikingsValhalla', alliance: 'VIK', scoreValue: '14.2B', scoreLabel: 'Alliance Power' },
  { category: 'Alliance Power', rank: 4, playerName: 'MadChaos', alliance: 'MAD', scoreValue: '12.8B', scoreLabel: 'Alliance Power' },
  { category: 'Alliance Power', rank: 5, playerName: 'SquadDownBad', alliance: 'SDB', scoreValue: '10.5B', scoreLabel: 'Alliance Power' },

  { category: 'Alliance Kills', rank: 1, playerName: 'NastyAzzTroops', alliance: 'NAT', scoreValue: '4.82B', scoreLabel: 'Alliance Kills' },
  { category: 'Alliance Kills', rank: 2, playerName: 'OneForAll', alliance: 'HOT', scoreValue: '4.15B', scoreLabel: 'Alliance Kills' },
  { category: 'Alliance Kills', rank: 3, playerName: 'VikingsValhalla', alliance: 'VIK', scoreValue: '3.60B', scoreLabel: 'Alliance Kills' },
  { category: 'Alliance Kills', rank: 4, playerName: 'MadChaos', alliance: 'MAD', scoreValue: '2.95B', scoreLabel: 'Alliance Kills' },
  { category: 'Alliance Kills', rank: 5, playerName: 'SquadDownBad', alliance: 'SDB', scoreValue: '2.40B', scoreLabel: 'Alliance Kills' },

  // Personal Power (Top 10 from user screenshot)
  { category: 'Personal Power', rank: 1, playerName: 'PIGTATORDADDy', alliance: 'NAT', scoreValue: '671,030,304', scoreLabel: 'Power' },
  { category: 'Personal Power', rank: 2, playerName: 'EhMoose', alliance: 'NAT', scoreValue: '642,252,053', scoreLabel: 'Power' },
  { category: 'Personal Power', rank: 3, playerName: 'KLITlicker', alliance: 'VIK', scoreValue: '509,439,874', scoreLabel: 'Power' },
  { category: 'Personal Power', rank: 4, playerName: 'SuperBumbleBeep', alliance: 'HOT', scoreValue: '488,208,722', scoreLabel: 'Power' },
  { category: 'Personal Power', rank: 5, playerName: 'Moha HOT', alliance: 'HOT', scoreValue: '453,022,202', scoreLabel: 'Power' },
  { category: 'Personal Power', rank: 6, playerName: 'P@nd@', alliance: 'HOT', scoreValue: '433,211,587', scoreLabel: 'Power' },
  { category: 'Personal Power', rank: 7, playerName: 'OL DAWG', alliance: 'VIK', scoreValue: '428,787,600', scoreLabel: 'Power' },
  { category: 'Personal Power', rank: 8, playerName: 'King_Slayer', alliance: 'NAT', scoreValue: '412,550,120', scoreLabel: 'Power' },
  { category: 'Personal Power', rank: 9, playerName: 'Valkyrie', alliance: 'MAD', scoreValue: '405,190,400', scoreLabel: 'Power' },
  { category: 'Personal Power', rank: 10, playerName: 'Maddawg', alliance: 'SDB', scoreValue: '398,420,950', scoreLabel: 'Power' },

  // Private Categories from user screenshot
  { category: 'Town Center Level', rank: 1, playerName: 'East_666', alliance: 'NAT', scoreValue: 'TG 30 (FC 5)', scoreLabel: 'TG Level' },
  { category: 'Kill Count', rank: 1, playerName: 'PIGTATORDADDy', alliance: 'NAT', scoreValue: '1,420,550,230', scoreLabel: 'Kills' },
  { category: 'Rebel Conquest Stage', rank: 1, playerName: 'PIGTATORDADDy', alliance: 'NAT', scoreValue: 'Stage 420', scoreLabel: 'Stage' },
  { category: 'Hero Power', rank: 1, playerName: 'PIGTATORDADDy', alliance: 'NAT', scoreValue: '85,420,000', scoreLabel: 'Hero Power' },
  { category: 'Hero\'s Total Power', rank: 1, playerName: 'PIGTATORDADDy', alliance: 'NAT', scoreValue: '195,800,000', scoreLabel: 'Total Hero Power' },
  { category: 'Total Pet Power', rank: 1, playerName: 'SuperBumbleBeep', alliance: 'HOT', scoreValue: '68,230,000', scoreLabel: 'Pet Power' },
  { category: 'Island Prosperity', rank: 1, playerName: 'EhMoose', alliance: 'NAT', scoreValue: '14,850', scoreLabel: 'Prosperity' },
  { category: 'Mystic Trial', rank: 1, playerName: 'EhMoose', alliance: 'NAT', scoreValue: 'Floor 850', scoreLabel: 'Floor' },
  { category: 'Master Total Power', rank: 1, playerName: 'SuperBumbleBeep', alliance: 'HOT', scoreValue: '312,400,000', scoreLabel: 'Master Power' }
];

export const emptyKingdomData: KingdomData = {
  settings: emptySettings,
  alliances: [],
  team: [],
  kvkRecords: [],
  news: [],
  faq: [],
  leaderboard: initialLeaderboard,
  lastSyncedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // 2 hours ago by default
};


// Aliases for compatibility
export const defaultKingdomData = emptyKingdomData;
export const alliances: Alliance[] = [];
export const byId = (id?: string) => undefined;