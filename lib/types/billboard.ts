export interface Billboard {
  id: string;
  label: string;
  headline: string;
  summary: string;
  href: string;
  imageUrl: string;
  imagePrompt: string;
  layoutType: 'lead' | 'middle' | 'mini';
  position: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBillboardData {
  label: string;
  headline: string;
  summary?: string;
  href: string;
  imagePrompt?: string;
  layoutType?: 'lead' | 'middle' | 'mini';
  position?: number;
  isActive?: boolean;
}

export interface UpdateBillboardData extends Partial<CreateBillboardData> {
  imageUrl?: string;
}
