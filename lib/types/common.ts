export interface ActionResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  pages: number;
}
