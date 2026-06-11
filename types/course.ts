export interface Content {
  id: string;
  course: string;
  title: string;
  instructor_name: string;
  video_url: string | null;
  video_file: string | null;
  thumbnail: string | null;
  duration: number;
  document_url: string | null;
  document_file: string | null;
  course_level: string;
  order: number;
  is_preview: boolean;
  created_at: string;
}

export interface Course {
  id: string;
  vendor: string;
  vendor_name: string;
  category: string;
  category_name: string;
  title: string;
  description: string;
  thumbnail: string | null;
  price: string;
  course_type: "free" | "paid";
  is_published: boolean;
  created_at: string;
  contents: Content[];
  instructor?: string;
  duration?: string;
  lessons_count?: number;
  rating?: number;
  enrolled_count?: number;
  level?: string;
  is_enrolled?: boolean;
}

export type Tab = "lessons" | "docs" | "about";
