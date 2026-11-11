import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <aside
      class="shrink-0 border-b border-slate-800 bg-slate-900/70 p-4 lg:min-h-full lg:w-64 lg:border-b-0 lg:border-r lg:p-5"
    >
      <a routerLink="/dashboard" class="mb-5 hidden items-center gap-3 lg:mb-9 lg:flex">
        <span
          class="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-300"
        >
          <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="1.8"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414A1 1 0 0119 9v10a2 2 0 01-2 2z"
            />
          </svg>
        </span>
        <span>
          <span class="block text-sm font-semibold text-white">PDF Automation</span>
          <span class="block text-xs text-slate-400">Workspace</span>
        </span>
      </a>

      <nav aria-label="Workspace navigation" class="flex gap-2 overflow-x-auto lg:flex-col">
        <a
          routerLink="/dashboard"
          routerLinkActive="border-indigo-500/30 bg-indigo-500/10 text-indigo-200"
          [routerLinkActiveOptions]="{ exact: true }"
          class="flex shrink-0 items-center gap-3 rounded-xl border border-transparent px-3 py-2.5 text-sm font-medium text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-100"
        >
          <svg class="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="1.8"
              d="M4 4h7v7H4V4zm9 0h7v4h-7V4zm0 6h7v10h-7V10zM4 13h7v7H4v-7z"
            />
          </svg>
          Dashboard
        </a>
        <a
          routerLink="/new-automation"
          routerLinkActive="border-indigo-500/30 bg-indigo-500/10 text-indigo-200"
          class="flex shrink-0 items-center gap-3 rounded-xl border border-transparent px-3 py-2.5 text-sm font-medium text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-100"
        >
          <svg class="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="1.8"
              d="M12 5v14m-7-7h14"
            />
          </svg>
          New PDF Automation
        </a>
        <a
          routerLink="/templates"
          routerLinkActive="border-indigo-500/30 bg-indigo-500/10 text-indigo-200"
          class="flex shrink-0 items-center gap-3 rounded-xl border border-transparent px-3 py-2.5 text-sm font-medium text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-100"
        >
          <svg class="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="1.8"
              d="M7 3h7l5 5v11a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2zm7 0v5h5M8 13h8m-8 4h8"
            />
          </svg>
          Templates
        </a>
        <a
          routerLink="/data-sources"
          routerLinkActive="border-indigo-500/30 bg-indigo-500/10 text-indigo-200"
          class="flex shrink-0 items-center gap-3 rounded-xl border border-transparent px-3 py-2.5 text-sm font-medium text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-100"
        >
          <svg class="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="1.8"
              d="M4 6.5C4 5.12 7.58 4 12 4s8 1.12 8 2.5S16.42 9 12 9 4 7.88 4 6.5zm0 0v11c0 1.38 3.58 2.5 8 2.5s8-1.12 8-2.5v-11M4 12c0 1.38 3.58 2.5 8 2.5s8-1.12 8-2.5"
            />
          </svg>
          Data Sources
        </a>
      </nav>
    </aside>
  `,
})
export class SidebarComponent {}
