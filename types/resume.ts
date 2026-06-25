export type ResumeTemplate = "classic" | "modern" | "minimal" | "bold";

export interface ResumeData {
  personalInfo: {
    name: string;
    title: string;
    email: string;
    phone: string;
    location: string;
    website: string;
    bio: string;
    avatarUrl: string;
  };
  experience: {
    id: string;
    company: string;
    role: string;
    startDate: string;
    endDate: string;
    current: boolean;
    description: string;
  }[];
  education: {
    id: string;
    institution: string;
    degree: string;
    field: string;
    startDate: string;
    endDate: string;
    grade: string;
  }[];
  skills: string[];
  links: {
    label: string;
    url: string;
  }[];
}

export interface ResumeState {
  template: ResumeTemplate;
  data: ResumeData;
}
