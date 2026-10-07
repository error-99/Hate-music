export type TabType = 'tab1' | 'tab2' | 'tab3';

export interface ToastItem {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

export interface VideoMetadata {
  title: string;
  channel: string;
  thumbnail_url: string;
  video_id: string;
}

export interface CleanStats {
  before: number;
  after: number;
  removed: number;
}

export interface VideoResultStats {
  size_mb: number;
  duration: number;
}
