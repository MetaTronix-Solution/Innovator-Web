export interface Reel {
  id: string;
  reel_id: string;
  title: string;
  description?: string;
  video_url: string;
  thumbnail_url?: string;
  user_id: string;
  username?: string;
  user_avatar?: string;
  likes_count: number;
  comments_count: number;
  views_count: number;
  created_at: string;
  updated_at: string;
}

export interface CreateReelDTO {
  title: string;
  description?: string;
  video: File;
  thumbnail?: File;
}

export interface UpdateReelDTO {
  title?: string;
  description?: string;
  video?: File;
  thumbnail?: File;
}
