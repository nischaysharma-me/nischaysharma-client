import { create } from 'zustand';

interface Template {
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

interface TemplateConfig {
  categories: {
    id: string;
    label: string;
    description: string;
  }[];
}

interface TemplateState {
  templates: Template[];
  templateConfig: TemplateConfig | null;
  generating: boolean;
  
  // Actions
  setTemplates: (templates: Template[]) => void;
  setTemplateConfig: (config: TemplateConfig) => void;
  setGenerating: (isGenerating: boolean) => void;
  addTemplate: (template: Template) => void;
}

export const useTemplateStore = create<TemplateState>((set) => ({
  templates: [],
  templateConfig: null,
  generating: false,

  setTemplates: (templates) => set({ templates }),
  setTemplateConfig: (templateConfig) => set({ templateConfig }),
  setGenerating: (generating) => set({ generating }),
  addTemplate: (template) => set((state) => ({ 
    templates: [template, ...state.templates] 
  })),
}));
