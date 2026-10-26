export type TemplateType = 'pdf' | 'docx';
export type SourceFormat = 'csv' | 'xlsx' | 'xls';

export interface ColumnDefinition {
  key: string;
  label: string;
  sampleValue: string;
}

export interface RowData {
  [columnKey: string]: string | number;
}

export interface TemplatePlaceholder {
  key: string;
  label: string;
  sampleMapping: string;
  type: 'text' | 'date' | 'currency' | 'badge';
}

export interface PresetDemo {
  id: string;
  name: string;
  description: string;
  sourceType: SourceFormat;
  templateType: TemplateType;
  fileNameData: string;
  fileNameTemplate: string;
  recordsCount: number;
  columns: ColumnDefinition[];
  rows: RowData[];
  placeholders: TemplatePlaceholder[];
}

