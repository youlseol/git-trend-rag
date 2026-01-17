export interface Repo {
  id: number | string;
  name: string; // "owner/repo"
  description: string | null;
  html_url: string;
  language: string | null;
  stargazers_count: number;
  owner: {
    avatar_url: string;
    login: string;
  };
  topics?: string[];
  // AI-enhanced fields
  aiInsight?: string;
}

export enum TrendingPeriod {
  DAILY = 'Today',
  WEEKLY = 'This Week',
  MONTHLY = 'This Month'
}

export interface TrendingFilter {
  period: TrendingPeriod;
  language: string;
}

export interface GroundingSource {
  title?: string;
  uri?: string;
}