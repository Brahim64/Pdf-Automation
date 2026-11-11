import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-workspace-placeholder',
  standalone: true,
  template: `
    <section class="min-h-[50vh] bg-slate-950 px-4 py-10 text-slate-100 sm:px-6 lg:px-10">
      <div class="mx-auto max-w-7xl">
        <h1 class="text-2xl font-bold tracking-tight text-white sm:text-3xl">{{ title }}</h1>
        <div class="mt-8 rounded-2xl border border-dashed border-slate-800 px-6 py-14 text-center">
          <p class="text-sm font-medium text-slate-300">{{ emptyMessage }}</p>
          <p class="mt-2 text-sm text-slate-500">This feature is planned for a future update.</p>
        </div>
      </div>
    </section>
  `
})
export class WorkspacePlaceholderComponent {
  private readonly route = inject(ActivatedRoute);

  get title(): string {
    return this.route.snapshot.data['title'] as string;
  }

  get emptyMessage(): string {
    return this.route.snapshot.data['emptyMessage'] as string;
  }
}
