export type PostStatus = 'draft' | 'published' | 'archived';

export interface Post {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  imageAltText?: string;
  tags: string[];
  authorId: string;
  status: PostStatus;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string | null;
}

export interface PostInput {
  title: string;
  content: string;
  imageUrl?: string;
  imageAltText?: string;
  tags?: string[];
  status?: PostStatus;
}
