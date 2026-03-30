import { create } from 'zustand';
import { postsService } from '@/services/posts.service';
import { Post, GeneratePostData } from '@/lib/types/post';
import { getAuthToken } from '@/lib/auth';

interface PostState {
  posts: Post[];
  loading: boolean;
  
  // Actions
  setPosts: (posts: Post[]) => void;
  setLoading: (loading: boolean) => void;
  fetchPosts: () => Promise<void>;
  generatePost: (data: GeneratePostData) => Promise<boolean>;
  publishPost: (id: string, platforms: string[]) => Promise<boolean>;
  deletePost: (id: string) => Promise<boolean>;
}

export const usePostsStore = create<PostState>((set, get) => ({
  posts: [],
  loading: false,

  setPosts: (posts) => set({ posts }),
  setLoading: (loading) => set({ loading }),

  fetchPosts: async () => {
    try {
      set({ loading: true });
      const token = await getAuthToken();
      if (!token) return;

      const response = await postsService.listPosts({}, token);
      if (response.success && response.data) {
        set({ posts: response.data });
      }
    } catch (err) {
      console.error('Error fetching posts:', err);
    } finally {
      set({ loading: false });
    }
  },

  generatePost: async (data: GeneratePostData) => {
    try {
      set({ loading: true });
      const token = await getAuthToken();
      if (!token) return false;

      const response = await postsService.generatePost(data, token);
      if (response.success) {
        await get().fetchPosts();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error generating post:', err);
      return false;
    } finally {
      set({ loading: false });
    }
  },

  publishPost: async (id: string, platforms: string[]) => {
    try {
      const token = await getAuthToken();
      if (!token) return false;
      
      const response = await postsService.publishPost(id, platforms, token);
      if (response.success) {
        await get().fetchPosts();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error publishing post:', err);
      return false;
    }
  },

  deletePost: async (id: string) => {
    try {
      const token = await getAuthToken();
      if (!token) return false;
      
      const response = await postsService.deletePost(id, token);
      if (response.success) {
        await get().fetchPosts();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error deleting post:', err);
      return false;
    }
  }
}));
