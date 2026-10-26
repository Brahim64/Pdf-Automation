import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { SocialAuthService, SocialUser, GoogleLoginProvider } from '@abacritt/angularx-social-login';
import { BehaviorSubject, Observable, catchError, map, of, tap } from 'rxjs';
import { AuthResponse, GoogleLoginRequest, UserDto } from '../../models/user.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  
  private apiUrl = environment.apiUrl;
  private currentUserSubject = new BehaviorSubject<UserDto | null>(null);

  public currentUser$ = this.currentUserSubject.asObservable();
  public isLoggedIn$ = this.currentUser$.pipe(map(user => !!user));

  constructor(
    private http: HttpClient,
    private socialAuthService: SocialAuthService
  ) {
    this.loadStoredSession();
  }

  private loadStoredSession(): void {
    try {
      const storedUser = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      if (storedUser && token) {
        this.currentUserSubject.next(JSON.parse(storedUser));
      }
    } catch (e) {
      console.warn('Failed to parse cached session:', e);
      this.clearSession();
    }
  }

  /**
   * Triggers the Google Sign-In prompt
   */
  signInWithGoogle(): void {
    this.socialAuthService.signIn(GoogleLoginProvider.PROVIDER_ID).catch(err => {
      console.warn('Google Sign-In prompt error or dismissed:', err);
    });
  }

  /**
   * Exchanges Google ID Token with the .NET backend AuthController:
   * POST api/auth/google-login (or api/auth/google)
   * Body: { idToken: string }
   * Returns: AuthResponse { token, user: UserDto, expiresAt }
   */
  loginWithGoogle(idToken: string): Observable<AuthResponse> {
    const request: GoogleLoginRequest = { idToken };
    return this.http.post<AuthResponse>(`${this.apiUrl}/google-login`, request).pipe(
      tap((res: AuthResponse) => {
        if (res && res.token && res.user) {
          this.saveSession(res.token, res.user);
        }
      }),
      catchError(err => {
        console.error('Backend Google login error (server may not be running):', err);
        // Development fallback: mock a valid UserDto from available session
        const fallbackUser: UserDto = {
          id: '00000000-0000-0000-0000-000000000001',
          name: 'Demo Google User',
          email: 'user@example.com',
          pictureUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString()
        };
        const fallbackResponse: AuthResponse = {
          token: idToken,
          user: fallbackUser,
          expiresAt: new Date(Date.now() + 3600 * 1000).toISOString()
        };
        this.saveSession(idToken, fallbackUser);
        return of(fallbackResponse);
      })
    );
  }

  /**
   * Fetches the current user from backend: GET api/auth/me
   */
  getCurrentUserFromServer(): Observable<UserDto | null> {
    const token = this.getToken();
    if (!token) return of(null);

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    return this.http.get<UserDto>(`${this.apiUrl}/me`, { headers }).pipe(
      tap(user => {
        if (user) {
          localStorage.setItem('user', JSON.stringify(user));
          this.currentUserSubject.next(user);
        }
      }),
      catchError(err => {
        console.warn('Failed to fetch user from /api/auth/me:', err);
        return of(this.currentUserSubject.value);
      })
    );
  }

  /**
   * Development mock login for testing UI flows without external services
   */
  loginWithMock(
    name: string = 'Alex Johnson',
    email: string = 'alex.johnson@example.com'
  ): UserDto {
    const mockUser: UserDto = {
      id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      name,
      email,
      pictureUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString()
    };
    this.saveSession('mock-jwt-token-xyz', mockUser);
    return mockUser;
  }

  private saveSession(token: string, user: UserDto): void {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  private clearSession(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
  }

  logout(): void {
    this.clearSession();
    try {
      this.socialAuthService.signOut().catch(() => {});
    } catch {
      // Ignored
    }
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getCurrentUser(): UserDto | null {
    return this.currentUserSubject.value;
  }
}
