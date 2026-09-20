export interface AllianceContact {
  name: string;
  playerId: string;
}

export interface AllianceEvents {
  bear: string[];
  vikings: string[];
  swordland: string[];
  threeAlliance: string[];
}

export interface Alliance {
  id: string;
  name?: string;
  description: string;
  contacts: AllianceContact[];
  events: AllianceEvents;
  color: string;
  crest: string;
  playstyle: string;
  transferStatus?: 'OPEN' | 'CLOSED' | 'INVITE ONLY' | string;
}

export interface TeamMember {
  name: string;
  playerId: string;
  role: string;
  category: 'Transfer Managers' | 'Alliance R5s' | 'Staff' | string;
  crest?: string;
  rank?: string;
  alliance?: string;
  pfp?: string;
}

export interface KvkRecord {
  kvk: string;
  opponent: string;
  prep: 'WIN' | 'LOSS' | string;
  battle: 'WIN' | 'LOSS' | string;
}

export interface NewsItem {
  icon: string;
  title: string;
  copy: string;
  cta: string;
  to: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface KingdomSettings {
  kingdomNumber: string;
  kingdomName: string;
  discordUrl: string;
  heroTitle: string;
  heroSubtitle: string;
  heroCopy: string;
}

export interface KingdomData {
  settings: KingdomSettings;
  alliances: Alliance[];
  team: TeamMember[];
  kvkRecords: KvkRecord[];
  news: NewsItem[];
  faq: FaqItem[];
}
