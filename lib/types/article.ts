export interface Article {
  id: string;
  title: string;
  description: string;
  content: string;
  slug: string;
  backgroundImage?: string;
  imagesAttached?: string[];
  publishedAt: string;
  authorId: string;
  status: string;
  tags?: string[];
  access?: string;
}

export interface CreateArticleData {
  title: string;
  description: string;
  content: string;
  tags?: string[];
  status?: string;
  access?: string;
}

export interface GenerateArticleData {
  topic: string;
  depth: string;
  instructions: string;
  templateId?: string;
}
