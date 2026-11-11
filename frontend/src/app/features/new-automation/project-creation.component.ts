import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, inject, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ProjectResponse } from '../../models/project.model';
import { ProjectService } from '../../core/services/project.service';

@Component({
  selector: 'app-project-creation',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="bg-slate-950 px-4 py-8 text-slate-100 sm:px-6 sm:py-12">
      <div class="mx-auto max-w-3xl space-y-8">
        <header class="space-y-3">
          <div class="inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-300">
            <span class="h-1.5 w-1.5 rounded-full bg-indigo-400"></span>
            Step 1 · Project
          </div>
          <div>
            <h2 class="text-3xl font-bold tracking-tight text-white sm:text-4xl">Create your project</h2>
            <p class="mt-2 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
              Projects keep your spreadsheets, templates, and generated PDFs together.
            </p>
          </div>
        </header>

        @if (createdProject) {
          <section class="rounded-2xl border border-emerald-500/20 bg-slate-900/60 p-6 shadow-xl shadow-black/10 sm:p-8">
            <p class="text-xs font-semibold uppercase tracking-wide text-emerald-300">Project created</p>
            <h3 class="mt-2 text-xl font-semibold text-white">{{ createdProject.name }}</h3>
            @if (createdProject.description) {
              <p class="mt-2 whitespace-pre-wrap text-sm text-slate-400">{{ createdProject.description }}</p>
            }
            <button
              type="button"
              (click)="next.emit(createdProject)"
              class="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-400"
            >
              Next: Import data
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14m-7-7 7 7-7 7" />
              </svg>
            </button>
          </section>
        } @else {
          <form
            #projectForm="ngForm"
            (ngSubmit)="createProject()"
            class="space-y-6 rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl shadow-black/10 sm:p-8"
          >
            <div>
              <label for="project-name" class="block text-sm font-medium text-slate-200">Project name</label>
              <input
                id="project-name"
                name="name"
                type="text"
                required
                maxlength="255"
                [(ngModel)]="name"
                class="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-slate-500 focus:border-indigo-400"
                placeholder="e.g. Q4 Customer Invoices"
              />
            </div>

            <div>
              <label for="project-description" class="block text-sm font-medium text-slate-200">
                Description <span class="font-normal text-slate-500">· Optional</span>
              </label>
              <textarea
                id="project-description"
                name="description"
                maxlength="1000"
                rows="4"
                [(ngModel)]="description"
                class="mt-2 w-full resize-y rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-slate-500 focus:border-indigo-400"
                placeholder="What will this project be used for?"
              ></textarea>
              <p class="mt-1 text-right text-xs text-slate-500">{{ description.length }}/1000</p>
            </div>

            @if (errorMessage) {
              <p class="rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-300" role="alert">
                {{ errorMessage }}
              </p>
            }

            <button
              type="submit"
              [disabled]="projectForm.invalid || isSaving"
              class="inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-400 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
            >
              {{ isSaving ? 'Creating project…' : 'Create project' }}
              @if (isSaving) {
                <span class="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></span>
              } @else {
                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14m-7-7 7 7-7 7" />
                </svg>
              }
            </button>
          </form>
        }
      </div>
    </section>
  `
})
export class ProjectCreationComponent {
  private readonly projectService = inject(ProjectService);
  private readonly changeDetector = inject(ChangeDetectorRef);
  readonly next = output<ProjectResponse>();

  name = '';
  description = '';
  isSaving = false;
  errorMessage: string | null = null;
  createdProject: ProjectResponse | null = null;

  createProject(): void {
    const name = this.name.trim();
    if (this.isSaving) {
      return;
    }
    if (!name) {
      this.errorMessage = 'Enter a project name.';
      return;
    }

    this.errorMessage = null;
    this.isSaving = true;
    this.projectService.createProject({
      name,
      description: this.description.trim() || null
    }).subscribe({
      next: (project) => {
        this.createdProject = project;
        this.isSaving = false;
        this.changeDetector.markForCheck();
        this.next.emit(project);
      },
      error: (error: unknown) => {
        this.errorMessage = this.getErrorMessage(error);
        this.isSaving = false;
        this.changeDetector.markForCheck();
      }
    });
  }

  private getErrorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      const apiMessage = error.error?.detail ?? error.error?.title ?? error.error?.message;
      if (typeof apiMessage === 'string') {
        return apiMessage;
      }
      if (error.status === 0) {
        return 'The project could not be created because the server could not be reached.';
      }
    }
    return error instanceof Error ? error.message : 'The project could not be created. Please try again.';
  }
}
