import { apiFetch } from './apiClient';

export interface DocNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  children?: DocNode[];
}

export interface DocContent {
  title: string;
  content: string; // HTML or Markdown string
  path: string;
  metadata?: any;
}

export const docsService = {
  /**
   * List documentation files and directories
   */
  listDocs: (password?: string) => {
    const options: any = { method: 'GET' };
    if (password) {
      options.method = 'POST';
      options.body = { password };
    }
    return apiFetch<{ success: boolean; data: DocNode[] }>('/docs', options);
  },

  /**
   * Get a specific documentation page by its path
   */
  getDoc: (path: string, password?: string) => {
    const options: any = { method: 'GET' };
    if (password) {
      options.method = 'POST';
      options.body = { password };
    }
    // path should start with /
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return apiFetch<{ success: boolean; data: DocContent }>(`/docs${normalizedPath}`, options);
  }
};
