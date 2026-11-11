import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-data-preview-table',
  standalone: true,
  template: `
    @if (headers.length) {
      <div class="overflow-hidden rounded-xl border border-slate-800">
        <div class="max-h-[28rem] overflow-auto">
          <table class="min-w-full border-collapse text-left text-sm">
            <thead class="sticky top-0 z-10 bg-slate-900">
              <tr>
                @for (header of headers; track $index) {
                  <th scope="col" class="whitespace-nowrap border-b border-slate-800 px-4 py-3 font-semibold text-slate-200">
                    {{ header || 'Column ' + ($index + 1) }}
                  </th>
                }
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800/80">
              @for (row of rows; track $index) {
                <tr class="transition-colors hover:bg-slate-800/40">
                  @for (header of headers; track $index) {
                    <td class="max-w-72 truncate px-4 py-3 text-slate-300" [title]="row[$index] ?? ''">
                      {{ row[$index] || '—' }}
                    </td>
                  }
                </tr>
              } @empty {
                <tr>
                  <td class="px-4 py-8 text-center text-sm text-slate-500" [attr.colspan]="headers.length">
                    No data rows to display.
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
        <div class="flex flex-wrap items-center justify-between gap-2 border-t border-slate-800 bg-slate-950/70 px-4 py-3 text-xs text-slate-400">
          <span>Showing {{ rows.length }} of {{ totalRows }} rows</span>
          <span>{{ headers.length }} columns</span>
        </div>
      </div>
    } @else {
      <div class="rounded-xl border border-dashed border-slate-800 px-6 py-14 text-center">
        <span class="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-slate-800/70 text-slate-500">
          <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M4 5h16M4 10h16M4 15h10m-10 4h10" />
          </svg>
        </span>
        <p class="mt-3 text-sm font-medium text-slate-300">Your data preview will appear here</p>
        <p class="mt-1 text-xs text-slate-500">Upload a spreadsheet, then click Display to inspect its rows and columns.</p>
      </div>
    }
  `
})
export class DataPreviewTableComponent {
  @Input() headers: string[] = [];
  @Input() rows: string[][] = [];
  @Input() totalRows = 0;
}
