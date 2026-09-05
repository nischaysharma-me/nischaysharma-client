export interface PromptDefinition {
  key: string;
  name: string;
  category: string;
  description: string;
  variables: string[];
  requiredVariables: string[];
  template: string;
  defaultTemplate: string;
  isOverridden: boolean;
  source: 'default' | 'local' | 'firestore';
  updatedAt: string | null;
  updatedBy: string | null;
}

export interface PromptRevision {
  id: string;
  template: string;
  source: string;
  changedAt: string | null;
  changedBy: string | null;
}
