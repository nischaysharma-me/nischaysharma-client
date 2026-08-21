export interface StackItem {
  id: string;
  title: string;
  link: string;
  linkType: 'internal' | 'external';
  imageUrl?: string;
  description?: string;
  icon?: string;
  color?: string;
  order: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateStackItemData {
  title: string;
  link: string;
  linkType?: 'internal' | 'external';
  imageUrl?: string;
  description?: string;
  icon?: string;
  color?: string;
  order?: number;
  isActive?: boolean;
}
