export interface TemplateResponse {
  id: string;
  projectId: string;
  fileName: string;
  templateType: number;
  fileExtension: string;
  fileSize: number;
  createdAt: string | Date;
}
