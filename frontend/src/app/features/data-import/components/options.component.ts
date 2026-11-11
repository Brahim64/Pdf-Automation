import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ImportOptions } from '../data-import.models';

@Component({
  selector: 'app-import-options',
  standalone: true,
  template: `
    <section class="space-y-5">
      <div>
        <label for="delimiter" class="mb-2 block text-sm font-medium text-slate-200">Delimiter</label>
        <select
          id="delimiter"
          class="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-slate-100 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20"
          [value]="delimiter"
          (change)="updateDelimiter($event)"
        >
          <option value=",">Comma (,)</option>
          <option value=";">Semicolon (;)</option>
          <option value="&#9;">Tab</option>
          <option value="|">Pipe (|)</option>
        </select>
        <p class="mt-1.5 text-xs text-slate-500">Used when reading CSV files.</p>
      </div>

      <div>
        <label for="preview-row-count" class="mb-2 block text-sm font-medium text-slate-200">Rows to preview</label>
        <select
          id="preview-row-count"
          class="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-slate-100 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20"
          (change)="updatePreviewRowCount($event)"
        >
          <option value="5" [selected]="previewRowCount === 5">5 rows</option>
          <option value="10" [selected]="previewRowCount === 10">10 rows</option>
          <option value="25" [selected]="previewRowCount === 25">25 rows</option>
        </select>
      </div>

      <button
        type="button"
        class="w-full rounded-xl bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-400 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
        [disabled]="!hasSelectedFile || isLoading"
        (click)="displayPreview()"
      >
        {{ isLoading ? 'Reading spreadsheet…' : 'Display' }}
      </button>

      <label class="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-800 bg-slate-950/60 p-3.5">
        <input
          type="checkbox"
          class="mt-0.5 h-4 w-4 rounded border-slate-600 bg-slate-900 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-slate-950"
          [checked]="firstRowIsHeader"
          (change)="updateHeader($event)"
        />
        <span>
          <span class="block text-sm font-medium text-slate-200">First row is a header</span>
          <span class="mt-1 block text-xs leading-relaxed text-slate-500">Use the first row as column names instead of data.</span>
        </span>
      </label>
    </section>
  `
})
export class OptionsComponent {
  @Input() delimiter = ',';
  @Input() previewRowCount = 5;
  @Input() firstRowIsHeader = true;
  @Input() hasSelectedFile = false;
  @Input() isLoading = false;
  @Output() optionsChange = new EventEmitter<ImportOptions>();
  @Output() displayRequested = new EventEmitter<ImportOptions>();

  updateDelimiter(event: Event): void {
    this.delimiter = (event.target as HTMLSelectElement).value;
    this.emitOptions();
  }

  updatePreviewRowCount(event: Event): void {
    this.previewRowCount = Number((event.target as HTMLSelectElement).value);
    this.emitOptions();
  }

  updateHeader(event: Event): void {
    this.firstRowIsHeader = (event.target as HTMLInputElement).checked;
    this.emitOptions();
  }

  displayPreview(): void {
    this.displayRequested.emit(this.currentOptions());
  }

  private emitOptions(): void {
    this.optionsChange.emit(this.currentOptions());
  }

  private currentOptions(): ImportOptions {
    return {
      delimiter: this.delimiter,
      previewRowCount: this.previewRowCount,
      firstRowIsHeader: this.firstRowIsHeader
    };
  }
}
