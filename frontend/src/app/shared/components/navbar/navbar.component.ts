import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { GoogleSigninButtonDirective } from '@abacritt/angularx-social-login';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, GoogleSigninButtonDirective],
  template: `
    <header class="sticky top-0 z-50 w-full backdrop-blur-md bg-slate-950/80 border-b border-slate-800/80 transition-all">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <!-- Brand -->
        <a [routerLink]="(currentUser$ | async) ? '/home' : '/'" class="flex items-center gap-3 group">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 p-0.5 shadow-md shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-shadow">
            <div class="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <svg class="w-5 h-5 text-indigo-400 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
          <div>
            <span class="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
              PDF <span class="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Automation</span>
              <span class="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">v1.0</span>
            </span>
            <span class="hidden sm:block text-[10px] text-slate-400 -mt-1 tracking-wider uppercase">CSV & Excel to Multi-Page PDF</span>
          </div>
        </a>

        <!-- Desktop Navigation Links -->
        <nav class="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
          @if (currentUser$ | async) {
            <a routerLink="/home" class="hover:text-white transition-colors text-indigo-400">Workspace</a>
          } @else {
            <a routerLink="/" class="hover:text-white transition-colors">Overview</a>
          }
        </nav>

        <!-- Right Side: Auth State -->
        <div class="flex items-center gap-3">
          <!-- When user is logged in -->
          @if (currentUser$ | async; as user) {
            <div class="flex items-center gap-3 bg-slate-900 border border-slate-800 rounded-full py-1 px-3 shadow-inner">
              @if (user.pictureUrl) {
                <img [src]="user.pictureUrl" [alt]="user.name || 'User'" class="w-7 h-7 rounded-full object-cover ring-2 ring-indigo-500/50" />
              } @else {
                <div class="w-7 h-7 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">
                  {{ (user.name || user.email || 'U').charAt(0).toUpperCase() }}
                </div>
              }
              <div class="hidden lg:flex flex-col text-left">
                <span class="text-xs font-semibold text-slate-200 leading-tight max-w-[120px] truncate">{{ user.name || 'Member' }}</span>
                <span class="text-[10px] text-slate-400 leading-tight max-w-[120px] truncate">{{ user.email || 'Connected' }}</span>
              </div>
              <button
                type="button"
                (click)="logout()"
                class="ml-1 text-xs text-rose-400 hover:text-rose-300 p-1 rounded-full hover:bg-rose-500/10 transition-colors"
                title="Sign out"
              >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          } @else {
            <!-- Not logged in: Show Google Sign In Button -->
            <div class="flex items-center gap-2">
              <div class="scale-90 origin-right max-h-[40px] flex items-center overflow-hidden rounded-lg">
                <asl-google-signin-button 
                  type="standard" 
                  size="medium" 
                  theme="outline" 
                  text="signin_with"
                  shape="rectangular">
                </asl-google-signin-button>
              </div>
            </div>
          }
        </div>
      </div>
    </header>
  `
})
export class NavbarComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  public currentUser$ = this.authService.currentUser$;

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
