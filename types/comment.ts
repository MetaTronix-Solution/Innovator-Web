export interface Reply {
  id: string;
  user_id: string;
  username: string;
  avatar?: string;
  content: string;
  created_at: string;
  replies?: Reply[];
}

export interface Comment {
  id: string;
  user_id: string;
  username: string;
  avatar?: string;
  content: string;
  created_at: string;
  replies_count?: number;
  replies?: Reply[];
}
