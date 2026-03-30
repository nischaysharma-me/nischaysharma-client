export interface PostPlatform {
  status: 'draft' | 'published' | 'failed';
  publishedAt: string | null;
  postId?: string | null;
  error?: string | null;
}

export interface PostPlatforms {
  app: PostPlatform;
  linkedin: PostPlatform;
}

export interface Post {
  id: string;
  userId: string;
  content: string;
  articleId?: string | null;
  bookId?: string | null;
  attachedMedia: string[];
  platforms: PostPlatforms;
  tags: string[];
  status: 'draft' | 'published' | 'archived' | 'failed';
  createdAt: string;
  updatedAt: string;
}

export interface CreatePostData {
  content: string;
  articleId?: string | null;
  bookId?: string | null;
  attachedMedia?: string[];
  tags?: string[];
}

export interface GeneratePostData {
  articleId?: string;
  bookId?: string;
}
