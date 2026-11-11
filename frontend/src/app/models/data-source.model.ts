export enum DataFileType {
  Csv = 1,
  Excel = 2
}

export interface DataSourceResponse {
  id: string;
  projectId: string;
  fileName: string;
  dataFileType: DataFileType;
  fileExtension: string;
  fileSize: number;
  createdAt: string | Date;
}
