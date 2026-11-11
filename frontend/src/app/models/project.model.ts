import { User } from './user.model';

export interface Project {
  id: string;
  projectId: string;
  name: string;
  description: string | null;
  ownerId: string;
  createdAt: string | Date;
  updatedAt: string | Date | null;
  owner: User | null;
  templates: unknown[];
  dataFiles: unknown[];
  pdfResults: unknown[];
}

export type ProjectResponse = Pick<
  Project,
  'id' | 'projectId' | 'name' | 'description' | 'ownerId' | 'createdAt' | 'updatedAt'
>;

export interface CreateProjectRequest {
  name: string;
  description: string | null;
}

export type UpdateProjectRequest = CreateProjectRequest;
