import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <footer class="border-t border-slate-800 bg-slate-950 text-slate-400 py-10 px-4 sm:px-6 lg:px-8">
      <div class="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        <!-- Brand and summary -->
        <div class="md:col-span-2 space-y-3">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <span class="text-lg font-bold text-white tracking-tight">PDF Automation</span>
          </div>
          <p class="text-xs text-slate-400 max-w-md leading-relaxed">
            High-performance batch document generation platform. Ingests CSV and Excel spreadsheets alongside PDF or Word DOCX templates, mapping each row into an individual page of a consolidated multi-page PDF.
          </p>
          <div class="flex items-center gap-3 text-[11px] text-slate-500 pt-1">
            <span class="inline-flex items-center gap-1.5 text-emerald-400">
              <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Engine Ready
            </span>
            <span>•</span>
            <span>Google OAuth 2.0</span>
            <span>•</span>
            <span>PostgreSQL & .NET 9</span>
          </div>
        </div>

        <!-- Supported Formats -->
        <div>
          <h4 class="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-3">Supported Formats</h4>
          <ul class="space-y-1.5 text-xs">
            <li class="flex items-center gap-2 text-slate-400">
              <span class="w-1.5 h-1.5 rounded-full bg-indigo-500"></span> CSV (Comma-Separated)
            </li>
            <li class="flex items-center gap-2 text-slate-400">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Microsoft Excel (.xlsx, .xls)
            </li>
            <li class="flex items-center gap-2 text-slate-400">
              <span class="w-1.5 h-1.5 rounded-full bg-rose-500"></span> Adobe Fillable PDF Form
            </li>
            <li class="flex items-center gap-2 text-slate-400">
              <span class="w-1.5 h-1.5 rounded-full bg-blue-500"></span> Word Document (.docx)
            </li>
          </ul>
        </div>

        <!-- Quick Links -->
        <div>
          <h4 class="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-3">Navigation</h4>
          <ul class="space-y-1.5 text-xs">
            <li><a routerLink="/" class="hover:text-white transition-colors">Landing Page</a></li>
            <li><a routerLink="/home" class="hover:text-white transition-colors">Workspace</a></li>
          </ul>
        </div>
      </div>

      <div class="max-w-7xl mx-auto pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-4">
        <div>
          © 2026 PDF Automation. All rights reserved.
        </div>
        <div class="flex items-center gap-6">
          <span>Google OAuth 2.0 Verified</span>
          <span>Privacy</span>
          <span>Terms</span>
        </div>
      </div>
    </footer>
  `
})
export class FooterComponent {}
