import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, Input, inject, output } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { DataSourceService } from '../../core/services/data-source.service';
import { DataPreviewTableComponent } from './components/data-preview-table.component';
import { FileDropzoneComponent } from './components/file-dropzone.component';
import { OptionsComponent } from './components/options.component';
import { ImportOptions } from './data-import.models';

@Component({
  selector: 'app-data-import',
  standalone: true,
  imports: [CommonModule, FileDropzoneComponent, OptionsComponent, DataPreviewTableComponent],
  templateUrl: './data-import.component.html'
})
export class DataImportComponent {
  private readonly changeDetector = inject(ChangeDetectorRef);
  private readonly dataSources = inject(DataSourceService);
  readonly next = output<void>();
  readonly previous = output<void>();
  @Input() projectId = '';

  selectedFile: File | null = null;
  delimiter = ',';
  previewRowCount = 5;
  firstRowIsHeader = true;
  headers: string[] = [];
  previewRows: string[][] = [];
  totalRows = 0;
  isLoading = false;
  isUploading = false;
  parseError: string | null = null;
  uploadError: string | null = null;

  private rawRows: string[][] = [];
  private parseRequestId = 0;

  onFileChange(file: File | null): void {
    this.parseRequestId++;
    this.selectedFile = file;
    this.rawRows = [];
    this.headers = [];
    this.previewRows = [];
    this.totalRows = 0;
    this.parseError = null;
    this.uploadError = null;
    this.isLoading = false;
  }

  onContinue(): void {
    const file = this.selectedFile;
    if (!file || this.isUploading) {
      return;
    }

    this.uploadError = null;
    this.isUploading = true;
    this.dataSources.upload(file, this.projectId).subscribe({
      next: () => {
        this.isUploading = false;
        this.changeDetector.markForCheck();
        this.next.emit();
      },
      error: (error: unknown) => {
        this.uploadError = this.getUploadErrorMessage(error);
        this.isUploading = false;
        this.changeDetector.markForCheck();
      }
    });
  }

  async onDisplayPreview(options: ImportOptions): Promise<void> {
    this.delimiter = options.delimiter;
    this.previewRowCount = options.previewRowCount;
    this.firstRowIsHeader = options.firstRowIsHeader;

    const file = this.selectedFile;
    if (!file) {
      return;
    }

    const requestId = ++this.parseRequestId;
    this.parseError = null;
    if (file.size === 0) {
      this.parseError = 'The selected file is empty.';
      this.isLoading = false;
      return;
    }

    this.isLoading = true;
    try {
      const isCsv = file.name.toLowerCase().endsWith('.csv');
      const XLSX = await import('@e965/xlsx');
      const workbook = XLSX.read(await file.arrayBuffer(), {
        type: 'array',
        ...(isCsv ? { FS: this.delimiter } : {})
      });

      if (requestId !== this.parseRequestId) return;
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = firstSheetName ? workbook.Sheets[firstSheetName] : undefined;
      if (!worksheet) {
        throw new Error('No worksheet was found in the selected file.');
      }

      this.rawRows = XLSX.utils
        .sheet_to_json<unknown[]>(worksheet, { header: 1, raw: false, defval: '' })
        .map((row) => row.map((cell) => (cell === null || cell === undefined ? '' : String(cell))));

      if (this.rawRows.length === 0) {
        throw new Error('No data was found in the first worksheet.');
      }

      this.updatePreview();
      this.changeDetector.markForCheck();
    } catch (error) {
      if (requestId !== this.parseRequestId) return;
      this.rawRows = [];
      this.headers = [];
      this.previewRows = [];
      this.totalRows = 0;
      this.parseError =
        error instanceof Error ? `Unable to read this file: ${error.message}` : 'Unable to read this file.';
      this.changeDetector.markForCheck();
    } finally {
      if (requestId === this.parseRequestId) {
        this.isLoading = false;
        this.changeDetector.markForCheck();
      }
    }
  }

  onOptionsChange(options: ImportOptions): void {
    this.delimiter = options.delimiter;
    this.previewRowCount = options.previewRowCount;
    this.firstRowIsHeader = options.firstRowIsHeader;
  }

  private updatePreview(): void {
    const columnCount = this.rawRows.reduce((count, row) => Math.max(count, row.length), 0);
    const dataRows = this.firstRowIsHeader ? this.rawRows.slice(1) : this.rawRows;

    this.headers = this.firstRowIsHeader
      ? Array.from({ length: columnCount }, (_, index) => this.rawRows[0]?.[index] ?? '')
      : Array.from({ length: columnCount }, (_, index) => `Column ${index + 1}`);
    this.totalRows = dataRows.length;
    this.previewRows = dataRows.slice(0, this.previewRowCount);
  }

  private getUploadErrorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      const message = error.error?.detail ?? error.error?.title ?? error.error?.message;
      if (typeof message === 'string') {
        return message;
      }
    }
    return error instanceof Error ? error.message : 'The data source could not be uploaded. Please try again.';
  }
}
