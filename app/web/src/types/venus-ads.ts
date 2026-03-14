export interface VenusAdAccount {
  id: number;
  user_id: number;
  project_id?: number;
  platform: string;
  account_name: string;
  account_id_external?: string;
  status: string;
  notes?: string;
  created_at: string;
}

export interface VenusCampaign {
  id: number;
  user_id: number;
  project_id?: number;
  ad_account_id?: number;
  platform: string;
  campaign_name: string;
  campaign_type?: string;
  status: string;
  objective?: string;
  budget_daily?: number;
  budget_total?: number;
  start_date?: string;
  end_date?: string;
  target_audience?: string;
  notes?: string;
  ai_analysis?: string;
  tags?: any[];
  created_at: string;
}

export interface VenusDailyMetric {
  id: number;
  user_id: number;
  campaign_id: number;
  date: string;
  platform: string;
  spend: number;
  impressions: number;
  clicks: number;
  ctr: number;
  cpc: number;
  conversions: number;
  conversion_value: number;
  purchases: number;
  purchase_value: number;
  roas: number;
  cpa: number;
  frequency: number;
  source: string;
}

export interface VenusExperiment {
  id: number;
  user_id: number;
  project_id?: number;
  campaign_id?: number;
  experiment_name: string;
  hypothesis?: string;
  status: string;
  start_date?: string;
  end_date?: string;
  metrics_tracked?: any[];
  winner?: string;
  learnings?: string;
  created_at: string;
}

export interface VenusCreative {
  id: number;
  user_id: number;
  project_id?: number;
  creative_name: string;
  creative_type: string;
  format?: string;
  url?: string;
  thumbnail_url?: string;
  designer?: string;
  notes?: string;
  performance_score?: number;
  status: string;
  tags?: any[];
  created_at: string;
}
