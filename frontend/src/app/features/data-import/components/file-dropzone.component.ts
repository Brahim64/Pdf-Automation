import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-file-dropzone',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="space-y-4">
      <button
        type="button"
        class="w-full rounded-2xl border-2 border-dashed p-8 text-center transition-colors sm:p-10"
        [class.border-indigo-400]="isDragging"
        [class.bg-indigo-500/10]="isDragging"
        [class.border-slate-700]="!isDragging"
        [class.hover:border-indigo-400]="!isDragging"
        [class.hover:bg-slate-800/50]="!isDragging"
        (click)="fileInput.click()"
        (dragover)="onDragOver($event)"
        (dragleave)="onDragLeave($event)"
        (drop)="onDrop($event)"
      >
        <input
          #fileInput
          type="file"
          class="sr-only"
          accept=".csv,.xls,.xlsx"
          (change)="onFileInputChange($event)"
        />
        <span class="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-300">
          <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M12 16V4m0 0L7 9m5-5 5 5M5 14v4a2 2 0 002 2h10a2 2 0 002-2v-4" />
          </svg>
        </span>
        <span class="mt-4 block text-sm font-semibold text-white">Drop your spreadsheet here</span>
        <span class="mt-1 block text-sm text-slate-400">or browse files from your device</span>
        <span class="mt-4 inline-flex rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs text-slate-400">
          CSV, XLS, XLSX
        </span>
      </button>

      @if (errorMessage) {
        <p class="rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-300" role="alert">
          {{ errorMessage }}
        </p>
      }

      @if (selectedFile) {
        <div class="flex items-center justify-between gap-4 rounded-xl border border-slate-800 bg-slate-950/70 p-4">
          <div class="flex min-w-0 items-center gap-3">
            <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-300">
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M7 3h7l5 5v11a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2zm7 0v5h5M8 13h8m-8 4h8" />
              </svg>
            </span>
            <span class="min-w-0">
              <span class="block truncate text-sm font-medium text-slate-100">{{ selectedFile.name }}</span>
              <span class="mt-0.5 block text-xs text-slate-400">{{ formatFileSize(selectedFile.size) }} · {{ fileFormat }}</span>
            </span>
          </div>
          <button
            type="button"
            class="shrink-0 rounded-lg p-2 text-slate-400 transition-colors hover:bg-rose-500/10 hover:text-rose-300"
            aria-label="Remove selected file"
            title="Remove file"
            (click)="clearFile()"
          >
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      }
    </section>
  `
})
export class FileDropzoneComponent {
  @Input() selectedFile: File | null = null;
  @Output() fileChange = new EventEmitter<File | null>();

  isDragging = false;
  errorMessage: string | null = null;

  get fileFormat(): string {
    return this.selectedFile?.name.split('.').pop()?.toUpperCase() ?? '';
  }

  onFileInputChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectFiles(input.files);
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
    this.selectFiles(event.dataTransfer?.files ?? null);
  }

  clearFile(): void {
    this.errorMessage = null;
    this.fileChange.emit(null);
  }

  formatFileSize(size: number): string {
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  }

  private selectFiles(files: FileList | null): void {
    this.errorMessage = null;
    if (!files?.length) return;
    if (files.length > 1) {
      this.errorMessage = 'Select one spreadsheet at a time.';
      return;
    }

    const file = files.item(0);
    if (!file) return;

    if (!/\.(csv|xls|xlsx)$/i.test(file.name)) {
      this.errorMessage = 'Choose a CSV, XLS, or XLSX file.';
      return;
    }

    this.fileChange.emit(file);
  }
}
