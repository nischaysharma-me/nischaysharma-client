export interface ProjectResource {
  title: string;
  url: string;
}

export interface Project {
  id?: string;
  userId: string;
  title: string;
  description: string;
  image: string;
  link: string;
  tags: string[];
  skills: string[];
  relatedArticles: string[]; // Article IDs
  resources: ProjectResource[];
  isFeatured: boolean;
  order: number;
  createdAt?: string;
  updatedAt?: string;
}

export type CreateProjectData = Omit<Project, 'id' | 'userId' | 'createdAt' | 'updatedAt'>;
