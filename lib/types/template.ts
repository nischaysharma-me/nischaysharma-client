export interface Template {
  id: string;
  name: string;
  category: string;
  description?: string;
  aiInstructions?: string;
  isPublic?: boolean;
  structure?: {
    heading: string;
    contentBrief: string;
    imagePrompt?: string;
  }[];
}

export interface GenerateTemplateData {
  description: string;
  category: string;
}

export interface TemplateConfig {
  categories: {
    id: string;
    label: string;
    description: string;
  }[];
}
