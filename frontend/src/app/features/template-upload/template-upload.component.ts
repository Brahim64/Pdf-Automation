import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, Input, OnDestroy, inject, output } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { FileUploadService } from '../../core/services/file-upload.service';

@Component({
  selector: 'app-template-upload',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './template-upload.component.html'
})
export class TemplateUploadComponent implements OnDestroy {
  private readonly sanitizer = inject(DomSanitizer);
  private readonly changeDetector = inject(ChangeDetectorRef);
  private readonly fileUpload = inject(FileUploadService);
  private objectUrl: string | null = null;
  readonly previous = output<void>();
  readonly next = output<void>();
  @Input() projectId = '';

  selectedFile: File | null = null;
  previewUrl: SafeResourceUrl | null = null;
  isDragging = false;
  isUploading = false;
  errorMessage: string | null = null;

  onFileInputChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!this.isUploading) {
      this.selectFile(input.files?.item(0) ?? null);
    }
    input.value = '';
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = false;
    if (!this.isUploading) {
      this.selectFile(event.dataTransfer?.files.item(0) ?? null);
    }
  }

  removeFile(): void {
    if (this.isUploading) {
      return;
    }

    this.releasePreviewUrl();
    this.selectedFile = null;
    this.previewUrl = null;
    this.errorMessage = null;
    this.isUploading = false;
  }

  formatFileSize(size: number): string {
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  }

  ngOnDestroy(): void {
    this.releasePreviewUrl();
  }

  onContinue(): void {
    const file = this.selectedFile;
    if (!file || this.isUploading) {
      return;
    }

    this.errorMessage = null;
    this.isUploading = true;
    this.fileUpload.uploadTemplate(file, this.projectId).subscribe({
      next: () => {
        this.isUploading = false;
        this.changeDetector.markForCheck();
        this.next.emit();
      },
      error: (error: unknown) => {
        this.errorMessage = this.getUploadErrorMessage(error);
        this.isUploading = false;
        this.changeDetector.markForCheck();
      }
    });
  }

  private selectFile(file: File | null): void {
    if (!file) return;
    this.errorMessage = null;

    if (!/\.pdf$/i.test(file.name)) {
      this.errorMessage = 'Choose a PDF template file.';
      return;
    }

    if (file.size === 0) {
      this.errorMessage = 'The selected PDF is empty.';
      return;
    }

    this.releasePreviewUrl();
    this.selectedFile = file;
    this.isUploading = false;
    this.objectUrl = URL.createObjectURL(file);
    this.previewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.objectUrl);
  }

  private releasePreviewUrl(): void {
    if (this.objectUrl) {
      URL.revokeObjectURL(this.objectUrl);
      this.objectUrl = null;
    }
  }

  private getUploadErrorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      const message = error.error?.detail ?? error.error?.title ?? error.error?.message;
      if (typeof message === 'string') {
        return message;
      }
    }
    return error instanceof Error ? error.message : 'The template could not be uploaded. Please try again.';
  }
}
