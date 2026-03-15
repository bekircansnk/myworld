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
  creative_id?: number;
  hypothesis?: string;
  status: string;
  start_date?: string;
  end_date?: string;
  metrics_tracked?: any[];
  winner?: string;
  learnings?: string;
  ai_comment?: string;
  created_at: string;
}

export interface VenusCreative {
  id: number;
  user_id: number;
  project_id?: number;
  campaign_id?: number;
  experiment_id?: number;
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

export interface VenusAdsTask {
  id: number;
  user_id: number;
  project_id?: number;
  campaign_id?: number;
  experiment_id?: number;
  creative_id?: number;
  title: string;
  description?: string;
  category: string;
  priority: string;
  status: string;
  due_date?: string;
  source: string;
  ai_notes?: string;
  completed_at?: string;
  created_at: string;
}

export interface VenusReportTemplate {
  id: number;
  user_id: number;
  project_id?: number;
  title: string;
  template_type: string;
  sections?: any;
  is_default: boolean;
  created_at: string;
}

export interface VenusCompetitor {
  id: number;
  user_id: number;
  project_id?: number;
  brand_name: string;
  website_url?: string;
  ad_library_url?: string;
  category?: string;
  notes?: string;
  strengths?: string;
  weaknesses?: string;
  creative_style?: string;
  tags?: any[];
  created_at: string;
}

export interface VenusOnboardingChecklist {
  id: number;
  user_id: number;
  project_id?: number;
  client_name: string;
  status: string;
  items?: { title: string; done: boolean; notes?: string }[];
  notes?: string;
  created_at: string;
}

export interface VenusCSVImport {
  id: number;
  user_id: number;
  project_id?: number;
  filename: string;
  platform_source: string;
  rows_imported: number;
  status: string;
  error_log?: string;
  created_at: string;
}

export interface VenusAIObservation {
  id: number;
  user_id: number;
  project_id?: number;
  campaign_id?: number;
  observation_type: string;
  title: string;
  content: string;
  severity: string;
  is_acknowledged: boolean;
  related_date_range?: string;
  created_at: string;
}
