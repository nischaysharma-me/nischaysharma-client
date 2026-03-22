import { create } from 'zustand';
import { articlesService } from '@/services/articles.service';
import { Article } from '@/lib/types/article';
import { getAuthToken } from '@/lib/auth';

interface ArticleState {
  articles: Article[];
  loading: boolean;
  
  // Actions
  setArticles: (articles: Article[]) => void;
  setLoading: (loading: boolean) => void;
  fetchArticles: () => Promise<void>;
  publishArticle: (id: string) => Promise<boolean>;
}

export const useArticlesStore = create<ArticleState>((set, get) => ({
  articles: [],
  loading: false,

  setArticles: (articles) => set({ articles }),
  setLoading: (loading) => set({ loading }),

  fetchArticles: async () => {
    try {
      set({ loading: true });
      const token = await getAuthToken();
      if (!token) return;

      const response = await articlesService.listArticles(undefined, token);
      if (response.success) {
        set({ articles: response.data });
      }
    } catch (err) {
      console.error('Error fetching articles:', err);
    } finally {
      set({ loading: false });
    }
  },

  publishArticle: async (id: string) => {
    try {
      const token = await getAuthToken();
      if (!token) return false;
      
      const response = await articlesService.publish(id, token);
      if (response.success) {
        await get().fetchArticles();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error publishing article:', err);
      return false;
    }
  }
}));
