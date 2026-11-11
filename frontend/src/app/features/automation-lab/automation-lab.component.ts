import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, ElementRef, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { DataSourceService } from '../../core/services/data-source.service';
import { TemplateService } from '../../core/services/template.service';
import { DataSourceResponse } from '../../models/data-source.model';
import { TemplateResponse } from '../../models/template.model';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-automation-lab',
  standalone: true,
  template: `
    <section class="flex min-h-[calc(100vh-4rem)] flex-col bg-slate-950 text-slate-100" aria-label="Automation Lab">
      <header class="border-b border-slate-800 px-5 py-4 sm:px-7">
        <h1 class="text-xl font-semibold text-white">Automation Lab</h1>
      </header>

      <div
        #splitContainer
        class="grid min-h-0 flex-1"
        [style.gridTemplateColumns]="leftPaneWidth + 'fr 8px ' + (100 - leftPaneWidth) + 'fr'"
      >
        <section class="flex min-h-0 min-w-0 flex-col overflow-auto p-5 sm:p-7" aria-label="Project template">
          <h2 class="text-sm font-semibold uppercase tracking-wide text-slate-300">Project template</h2>
          @if (isLoadingTemplates) {
            <p class="mt-5 text-sm text-slate-400" role="status">Loading project template…</p>
          } @else if (templateErrorMessage) {
            <p class="mt-5 rounded-lg border border-rose-500/20 bg-rose-500/10 p-3 text-sm text-rose-300" role="alert">
              {{ templateErrorMessage }}
            </p>
          } @else if (!selectedTemplate) {
            <p class="mt-5 text-sm leading-6 text-slate-400">No template was found for this project.</p>
          } @else {
            <p class="mt-3 truncate text-sm text-slate-400" [title]="selectedTemplate.fileName">
              {{ selectedTemplate.fileName }}
            </p>
            @if (isLoadingTemplatePreview) {
              <p class="mt-5 text-sm text-slate-400" role="status">Loading template preview…</p>
            } @else if (templatePreviewErrorMessage) {
              <p class="mt-5 rounded-lg border border-rose-500/20 bg-rose-500/10 p-3 text-sm text-rose-300" role="alert">
                {{ templatePreviewErrorMessage }}
              </p>
            } @else if (templatePreviewUrl) {
              <iframe
                class="mt-4 min-h-[32rem] w-full flex-1 rounded-xl border border-slate-800 bg-white"
                [src]="templatePreviewUrl"
                [title]="'PDF preview: ' + selectedTemplate.fileName"
              ></iframe>
            }
          }
        </section>

        <div
          class="group relative z-10 cursor-col-resize touch-none bg-slate-800 transition-colors hover:bg-indigo-500 focus-visible:bg-indigo-500"
          role="separator"
          aria-label="Resize automation workspace and data source panel"
          aria-orientation="vertical"
          aria-valuemin="20"
          aria-valuemax="80"
          [attr.aria-valuenow]="roundedLeftPaneWidth"
          tabindex="0"
          (pointerdown)="startResize($event)"
          (pointermove)="resize($event)"
          (pointerup)="stopResize($event)"
          (pointercancel)="stopResize($event)"
          (keydown)="onResizeKeydown($event)"
        >
          <span class="absolute inset-y-0 -left-2 -right-2"></span>
          <span class="absolute left-1/2 top-1/2 h-10 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-slate-500 group-hover:bg-white"></span>
        </div>

        <aside class="min-w-0 overflow-auto border-l border-slate-800 bg-slate-900/30 p-5 sm:p-7" aria-label="Data source columns">
          <h2 class="text-sm font-semibold uppercase tracking-wide text-slate-300">Data source columns</h2>

          @if (isLoadingDataSources) {
            <p class="mt-5 text-sm text-slate-400" role="status">Loading data sources…</p>
          } @else if (errorMessage) {
            <p class="mt-5 rounded-lg border border-rose-500/20 bg-rose-500/10 p-3 text-sm text-rose-300" role="alert">
              {{ errorMessage }}
            </p>
          } @else if (!selectedDataSource) {
            <p class="mt-5 text-sm leading-6 text-slate-400">No data sources were found for this project.</p>
          } @else {
            <p class="mt-4 truncate text-sm text-slate-400" [title]="selectedDataSource.fileName">
              {{ selectedDataSource.fileName }}
            </p>

            @if (isLoadingColumns) {
              <p class="mt-5 text-sm text-slate-400" role="status">Loading columns…</p>
            } @else if (columnsErrorMessage) {
              <p class="mt-5 rounded-lg border border-rose-500/20 bg-rose-500/10 p-3 text-sm text-rose-300" role="alert">
                {{ columnsErrorMessage }}
              </p>
            } @else if (columns.length === 0) {
              <p class="mt-5 text-sm text-slate-400">No columns were found in this data source.</p>
            } @else {
              <ul class="mt-4 space-y-2" aria-label="Columns">
                @for (column of columns; track $index) {
                  <li class="rounded-lg border border-slate-800 bg-slate-950/70 px-3 py-2.5 text-sm text-slate-200">
                    {{ column }}
                  </li>
                }
              </ul>
            }
          }
        </aside>
      </div>
    </section>
  `
})
export class AutomationLabComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly dataSourceService = inject(DataSourceService);
  private readonly templateService = inject(TemplateService);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly destroyRef = inject(DestroyRef);
  @ViewChild('splitContainer') private splitContainer!: ElementRef<HTMLElement>;

  leftPaneWidth = 58;
  dataSources: DataSourceResponse[] = [];
  columns: string[] = [];
  selectedDataSource: DataSourceResponse | null = null;
  selectedTemplate: TemplateResponse | null = null;
  templatePreviewUrl: SafeResourceUrl | null = null;
  isLoadingDataSources = true;
  isLoadingColumns = false;
  isLoadingTemplates = true;
  isLoadingTemplatePreview = false;
  errorMessage: string | null = null;
  columnsErrorMessage: string | null = null;
  templateErrorMessage: string | null = null;
  templatePreviewErrorMessage: string | null = null;
  private templateObjectUrl: string | null = null;
  private dataSourceRequestId = 0;
  private columnRequestId = 0;

  get roundedLeftPaneWidth(): number {
    return Math.round(this.leftPaneWidth);
  }

  ngOnInit(): void {
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const requestId = ++this.dataSourceRequestId;
      const projectId = params.get('projectId');
      this.columnRequestId++;
      this.releaseTemplatePreview();
      this.dataSources = [];
      this.columns = [];
      this.selectedDataSource = null;
      this.selectedTemplate = null;
      this.templatePreviewUrl = null;
      this.isLoadingColumns = false;
      this.isLoadingTemplatePreview = false;
      this.errorMessage = projectId ? null : 'A project ID is missing from this Automation Lab URL.';
      this.columnsErrorMessage = null;
      this.templateErrorMessage = projectId ? null : 'A project ID is missing from this Automation Lab URL.';
      this.templatePreviewErrorMessage = null;
      this.isLoadingDataSources = Boolean(projectId);
      this.isLoadingTemplates = Boolean(projectId);

      if (!projectId) {
        return;
      }

      this.loadProjectTemplate(projectId, requestId);
      this.dataSourceService.getAll(projectId)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (dataSources) => {
            if (requestId !== this.dataSourceRequestId) {
              return;
            }
            this.dataSources = dataSources;
            this.isLoadingDataSources = false;
            if (dataSources.length > 0) {
              this.loadColumns(dataSources[0]);
            }
          },
          error: (error: unknown) => {
            if (requestId !== this.dataSourceRequestId) {
              return;
            }
            this.errorMessage = this.getErrorMessage(error, 'Data sources could not be loaded.');
            this.isLoadingDataSources = false;
          }
        });
    });
  }

  ngOnDestroy(): void {
    this.releaseTemplatePreview();
  }

  private loadProjectTemplate(projectId: string, routeRequestId: number): void {
    this.templateService.getAll(projectId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (templates) => {
          if (routeRequestId !== this.dataSourceRequestId) {
            return;
          }
          this.isLoadingTemplates = false;
          if (templates.length > 0) {
            this.loadTemplatePreview(templates[0], routeRequestId);
          }
        },
        error: (error: unknown) => {
          if (routeRequestId !== this.dataSourceRequestId) {
            return;
          }
          this.templateErrorMessage = this.getErrorMessage(error, 'Project templates could not be loaded.');
          this.isLoadingTemplates = false;
        }
      });
  }

  private loadTemplatePreview(template: TemplateResponse, routeRequestId: number): void {
    this.selectedTemplate = template;
    this.isLoadingTemplatePreview = true;
    this.templatePreviewErrorMessage = null;
    this.templateService.download(template.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (file) => {
          if (routeRequestId !== this.dataSourceRequestId) {
            return;
          }
          this.releaseTemplatePreview();
          this.templateObjectUrl = URL.createObjectURL(file);
          this.templatePreviewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.templateObjectUrl);
          this.isLoadingTemplatePreview = false;
        },
        error: (error: unknown) => {
          if (routeRequestId !== this.dataSourceRequestId) {
            return;
          }
          this.templatePreviewErrorMessage = this.getErrorMessage(error, 'The project template could not be downloaded.');
          this.isLoadingTemplatePreview = false;
        }
      });
  }

  private releaseTemplatePreview(): void {
    if (this.templateObjectUrl) {
      URL.revokeObjectURL(this.templateObjectUrl);
      this.templateObjectUrl = null;
    }
  }

  private loadColumns(dataSource: DataSourceResponse): void {
    this.selectedDataSource = dataSource;
    this.columns = [];
    this.columnsErrorMessage = null;
    const requestId = ++this.columnRequestId;
    this.isLoadingColumns = true;

    this.dataSourceService.getColumns(dataSource.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (columns) => {
          if (requestId !== this.columnRequestId) {
            return;
          }
          this.columns = columns;
          this.isLoadingColumns = false;
        },
        error: (error: unknown) => {
          if (requestId !== this.columnRequestId) {
            return;
          }
          this.columnsErrorMessage = this.getErrorMessage(error, 'Columns could not be loaded.');
          this.isLoadingColumns = false;
        }
      });
  }

  startResize(event: PointerEvent): void {
    if (event.button !== 0 || !(event.currentTarget instanceof HTMLElement)) {
      return;
    }
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    this.resize(event);
  }

  resize(event: PointerEvent): void {
    if (!(event.currentTarget instanceof HTMLElement) || !event.currentTarget.hasPointerCapture(event.pointerId)) {
      return;
    }
    const bounds = this.splitContainer.nativeElement.getBoundingClientRect();
    if (bounds.width === 0) {
      return;
    }
    this.leftPaneWidth = Math.min(80, Math.max(20, ((event.clientX - bounds.left) / bounds.width) * 100));
  }

  stopResize(event: PointerEvent): void {
    if (event.currentTarget instanceof HTMLElement && event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  onResizeKeydown(event: KeyboardEvent): void {
    if (event.key === 'ArrowLeft') {
      this.leftPaneWidth = Math.max(20, this.leftPaneWidth - 2);
    } else if (event.key === 'ArrowRight') {
      this.leftPaneWidth = Math.min(80, this.leftPaneWidth + 2);
    } else if (event.key === 'Home') {
      this.leftPaneWidth = 20;
    } else if (event.key === 'End') {
      this.leftPaneWidth = 80;
    } else {
      return;
    }
    event.preventDefault();
  }

  private getErrorMessage(error: unknown, fallback: string): string {
    if (error instanceof HttpErrorResponse) {
      const message = error.error?.detail ?? error.error?.title ?? error.error?.message;
      if (typeof message === 'string') {
        return message;
      }
    }
    return error instanceof Error ? error.message : fallback;
  }
}
