import { apiFetch } from './apiClient';

export interface DocNavItem {
  name: string;
  path: string;
}

export interface DocSection {
  section: string;
  items: DocNavItem[];
}

export interface DocContent {
  title: string;
  content: string;
  markdown?: string;
  path?: string;
  navigation?: DocSection[];
}

export const docsService = {
  /**
   * Get the documentation navigation structure
   */
  getNavigation: () => {
    return apiFetch<{ success: boolean; data: DocContent }>('/docs/navigation', {
      method: 'GET',
    });
  },

  /**
   * Get documentation content by path
   * @param path - The relative path to the doc (e.g., 'guides/quick-start')
   */
  getDoc: (path: string) => {
    // We use the content endpoint which supports catch-all
    return apiFetch<{ success: boolean; data: DocContent }>(`/docs/content/${path}`, {
      method: 'GET',
    });
  },

  /**
   * Get the documentation index (landing page)
   */
  getIndex: () => {
    return apiFetch<{ success: boolean; data: DocContent }>('/docs/navigation', {
      method: 'GET',
    });
  }
};
