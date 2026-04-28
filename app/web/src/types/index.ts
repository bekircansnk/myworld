export interface Project {
  id: number;
  user_id: number;
  name: string;
  color: string;
  icon?: string;
  description?: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export interface Task {
  id: number;
  user_id: number;
  project_id?: number;
  parent_task_id?: number;
  title: string;
  description?: string;
  priority: 'urgent' | 'normal' | 'low';
  status: 'todo' | 'in_progress' | 'done';
  due_date?: string;
  estimated_minutes?: number;
  actual_minutes: number;
  ai_category?: string;
  ai_suggested_priority?: string;
  ai_analysis?: string;
  ai_analysis_history?: any[];
  sort_order: number;
  created_at: string;
  completed_at?: string;
  project?: Project;
}
export interface Note {
  id: number;
  user_id: number;
  project_id?: number;
  task_id?: number;
  content: string;
  title?: string;
  ai_category?: string;
  ai_tags?: string[];
  ai_analysis?: string;
  ai_analysis_history?: any[];
  tts_audio_url?: string;
  tts_text?: string;
  source: string;
  created_at?: string;
  updated_at?: string;
}
