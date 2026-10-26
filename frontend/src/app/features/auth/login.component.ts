import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { SocialAuthService, SocialUser, GoogleSigninButtonDirective } from '@abacritt/angularx-social-login';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterLink, GoogleSigninButtonDirective],
  template: `
    <div class="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center px-4 relative overflow-hidden">
      <!-- Background glow effects -->
      <div class="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"></div>
      <div class="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none"></div>

      <div class="w-full max-w-md bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-2xl p-8 shadow-2xl relative z-10">
        <!-- Logo / Header -->
        <div class="text-center mb-8">
          <a routerLink="/" class="inline-flex items-center gap-2 mb-4 group">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform">
              <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <span class="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-indigo-300 bg-clip-text text-transparent">
              PDF Automation
            </span>
          </a>
          <h2 class="text-2xl font-bold tracking-tight text-white">Welcome Back</h2>
          <p class="text-sm text-slate-400 mt-1">Sign in with your Google account to access your automated document pipeline</p>
        </div>

        <!-- Google Sign-In Container -->
        <div class="space-y-4">
          <div class="flex justify-center p-2 rounded-xl bg-slate-800/60 border border-slate-700/60 min-h-[50px] items-center">
            <asl-google-signin-button 
              type="standard" 
              size="large" 
              theme="outline" 
              text="signin_with"
              shape="rectangular"
              logo_alignment="left">
            </asl-google-signin-button>
          </div>

          <div class="relative flex items-center justify-center py-2">
            <div class="border-t border-slate-800 w-full"></div>
            <span class="bg-slate-900 px-3 text-xs text-slate-500 uppercase tracking-wider absolute">or quick access</span>
          </div>

          <!-- Quick Preview Mode for Local Development / Demonstration -->
          <button
            type="button"
            (click)="quickDemoLogin()"
            class="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-slate-600 transition-colors cursor-pointer"
          >
            <svg class="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Continue as Guest / Demo Mode
          </button>
        </div>

        <div class="mt-8 pt-6 border-t border-slate-800/80 text-center">
          <a routerLink="/" class="text-xs text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1 transition-colors">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home Page
          </a>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent implements OnInit {
  private socialAuthService = inject(SocialAuthService);
  private authService = inject(AuthService);
  private router = inject(Router);

  ngOnInit() {
    this.socialAuthService.authState.subscribe((user: SocialUser) => {
      if (user && user.idToken) {
        this.authService.loginWithGoogle(user.idToken).subscribe({
          next: () => {
            this.router.navigate(['/']);
          },
          error: (err) => console.error('Login failed', err)
        });
      }
    });
  }

  quickDemoLogin() {
    this.authService.loginWithMock('Demo Architect', 'demo.architect@example.com');
    this.router.navigate(['/']);
  }
}

