export type PhotoTrackingViewMode = 'overview' | 'calendar' | 'weekly' | 'models' | 'excel' | 'revisions';

export interface PhotoRevision {
  id: number;
  model_id: number;
  color_id?: number;
  description: string;
  revised_count: number;
  revised_at: string;
  created_at: string;
}

export interface PhotoModelColor {
  id: number;
  model_id: number;
  color_name: string;
  ig_required: boolean;
  ig_completed: boolean;
  ig_completed_at?: string;
  ig_photo_count: number;
  banner_required: boolean;
  banner_completed: boolean;
  banner_completed_at?: string;
  banner_photo_count: number;
  created_at: string;
}

export interface PhotoModel {
  id: number;
  user_id: number;
  project_id?: number;
  sezon_kodu?: string;
  model_name: string;
  week_number: number;
  month: number;
  year: number;
  status: string;
  delivery_date?: string;
  completed_at?: string;
  total_photos: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  colors: PhotoModelColor[];
  revisions: PhotoRevision[];
}

export interface PhotoOverviewStats {
  total_models: number;
  total_colors: number;
  total_photos: number;
  total_revisions: number;
}

export interface PhotoExcelImportLog {
  id: number;
  file_name: string;
  models_imported: number;
  colors_imported: number;
  status: string;
  error_log?: any;
  imported_at: string;
}
