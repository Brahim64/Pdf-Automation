import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { GoogleSigninButtonDirective, SocialAuthService, SocialUser } from '@abacritt/angularx-social-login';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, GoogleSigninButtonDirective],
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.css']
})
export class LandingComponent implements OnInit {
  public authService = inject(AuthService);
  private socialAuthService = inject(SocialAuthService);
  private router = inject(Router);

  public currentUser$ = this.authService.currentUser$;
  public isLoggingIn = false;
  public errorMessage: string | null = null;

  ngOnInit(): void {
    // If user is already logged in, redirect them to the home page
    if (this.authService.getCurrentUser() || this.authService.getToken()) {
      this.router.navigate(['/home']);
      return;
    }

    // Subscribe to Google OAuth state
    this.socialAuthService.authState.subscribe((user: SocialUser) => {
      if (user && user.idToken) {
        this.isLoggingIn = true;
        this.errorMessage = null;

        this.authService.loginWithGoogle(user.idToken).subscribe({
          next: () => {
            this.isLoggingIn = false;
            // Redirect to home page upon login
            this.router.navigate(['/home']);
          },
          error: (err) => {
            this.isLoggingIn = false;
            console.error('Google login failed:', err);
            this.errorMessage = 'Authentication failed. Please try again.';
          }
        });
      }
    });
  }

  /**
   * Fast Demo Login for local testing without requiring external credentials
   */
  demoLogin(): void {
    this.authService.loginWithMock('Sarah Connor', 'sarah.connor@example.com');
    this.router.navigate(['/home']);
  }
}
