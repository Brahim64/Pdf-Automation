import { Component, OnDestroy, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ProjectResponse } from '../../models/project.model';
import { DataImportComponent } from '../data-import/data-import.component';
import { ProjectCreationComponent } from './project-creation.component';
import { TemplateUploadComponent } from '../template-upload/template-upload.component';

@Component({
  selector: 'app-new-automation',
  standalone: true,
  imports: [ProjectCreationComponent, DataImportComponent, TemplateUploadComponent],
  template: `
    <div class="min-h-full bg-slate-950 text-slate-100">
      <header class="border-b border-slate-800 px-4 py-8 sm:px-6 lg:px-10">
        <div class="mx-auto max-w-7xl">
          <h1 class="text-2xl font-bold tracking-tight text-white sm:text-3xl">New PDF Automation</h1>
          <p class="mt-2 text-sm text-slate-400">Follow the steps to prepare your document automation.</p>

          <nav aria-label="PDF automation steps" class="mt-8">
            <ol class="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-4">
              <li>
                <button
                  type="button"
                  (click)="setStep(1)"
                  [disabled]="isPreparingLab"
                  [attr.aria-current]="activeStep === 1 ? 'step' : null"
                  [class.border-indigo-500]="activeStep === 1"
                  [class.bg-indigo-500/10]="activeStep === 1"
                  [class.text-indigo-200]="activeStep === 1"
                  class="flex w-full items-center gap-2 rounded-xl border border-slate-800 px-3 py-3 text-left text-xs font-medium text-slate-400 transition-colors hover:bg-slate-900 sm:gap-3 sm:px-4 sm:text-sm"
                >
                  <span class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-800 text-xs">1</span>
                  <span>Project</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  (click)="setStep(2)"
                  [disabled]="isPreparingLab"
                  [attr.aria-current]="activeStep === 2 ? 'step' : null"
                  [disabled]="!project"
                  [class.border-indigo-500]="activeStep === 2"
                  [class.bg-indigo-500/10]="activeStep === 2"
                  [class.text-indigo-200]="activeStep === 2"
                  class="flex w-full items-center gap-2 rounded-xl border border-slate-800 px-3 py-3 text-left text-xs font-medium text-slate-400 transition-colors hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-40 sm:gap-3 sm:px-4 sm:text-sm"
                >
                  <span class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-800 text-xs">2</span>
                  <span>Data Import</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  (click)="setStep(3)"
                  [disabled]="isPreparingLab"
                  [attr.aria-current]="activeStep === 3 ? 'step' : null"
                  [disabled]="!project"
                  [class.border-indigo-500]="activeStep === 3"
                  [class.bg-indigo-500/10]="activeStep === 3"
                  [class.text-indigo-200]="activeStep === 3"
                  class="flex w-full items-center gap-2 rounded-xl border border-slate-800 px-3 py-3 text-left text-xs font-medium text-slate-400 transition-colors hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-40 sm:gap-3 sm:px-4 sm:text-sm"
                >
                  <span class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-800 text-xs">3</span>
                  <span>Template Upload</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  (click)="setStep(4)"
                  [attr.aria-current]="activeStep === 4 ? 'step' : null"
                  [disabled]="!project || isPreparingLab"
                  [class.border-indigo-500]="activeStep === 4"
                  [class.bg-indigo-500/10]="activeStep === 4"
                  [class.text-indigo-200]="activeStep === 4"
                  class="flex w-full items-center gap-2 rounded-xl border border-slate-800 px-3 py-3 text-left text-xs font-medium text-slate-400 transition-colors hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-40 sm:gap-3 sm:px-4 sm:text-sm"
                >
                  <span class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-800 text-xs">4</span>
                  <span>PDF Automation Lab</span>
                </button>
              </li>
            </ol>
          </nav>
        </div>
      </header>

      <app-project-creation [hidden]="activeStep !== 1" (next)="onProjectCreated($event)" />
      <app-data-import
        [hidden]="activeStep !== 2"
        [projectId]="project?.projectId ?? ''"
        (previous)="activeStep = 1"
        (next)="activeStep = 3"
      />
      <app-template-upload
        [hidden]="activeStep !== 3"
        [projectId]="project?.projectId ?? ''"
        (previous)="activeStep = 2"
        (next)="openAutomationLab()"
      />
      @if (isPreparingLab) {
        <section
          class="flex min-h-[50vh] flex-col items-center justify-center gap-5 bg-slate-950 px-4 text-center text-slate-100"
          aria-live="polite"
          aria-busy="true"
        >
          <span
            class="h-14 w-14 animate-spin rounded-full border-4 border-indigo-400/20 border-t-indigo-400"
            role="status"
            aria-label="Loading Automation Lab"
          ></span>
          <div>
            <h2 class="text-xl font-semibold text-white">Preparing Automation Lab</h2>
            <p class="mt-2 text-sm text-slate-400">Getting your workspace ready…</p>
          </div>
        </section>
      }
    </div>
  `
})
export class NewAutomationComponent implements OnDestroy {
  private readonly router = inject(Router);
  private navigationTimeout: ReturnType<typeof setTimeout> | null = null;
  activeStep = 1;
  project: ProjectResponse | null = null;
  isPreparingLab = false;

  onProjectCreated(project: ProjectResponse): void {
    this.project = project;
    this.activeStep = 2;
  }

  setStep(step: number): void {
    if (step === 4) {
      this.openAutomationLab();
    } else if (step === 1 || this.project) {
      this.activeStep = step;
    }
  }

  openAutomationLab(): void {
    if (!this.project || this.isPreparingLab) {
      return;
    }

    const projectId = this.project.projectId;
    this.activeStep = 4;
    this.isPreparingLab = true;
    this.navigationTimeout = setTimeout(() => {
      this.router.navigate(['/automation-lab', projectId]);
    }, 2000);
  }

  ngOnDestroy(): void {
    if (this.navigationTimeout) {
      clearTimeout(this.navigationTimeout);
    }
  }
}
