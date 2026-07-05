import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap, switchMap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  ResetPasswordRequest,
} from '../../models/api.models';
import { TokenStorageService } from './token-storage.service';
import { UserProfileService } from '../profile/user-profile.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly tokenStorage = inject(TokenStorageService);
  private readonly router = inject(Router);
  private readonly userProfileService = inject(UserProfileService);

  private readonly authenticated = signal(this.tokenStorage.hasToken());
  readonly isAuthenticated = this.authenticated.asReadonly();

  readonly isAdmin = computed(() => {
    if (!this.authenticated()) {
      console.log('--- JWT Check: Not Authenticated ---');
      return false;
    }
    const token = this.tokenStorage.getToken();
    if (!token) {
      console.log('--- JWT Check: No Token Found ---');
      return false;
    }

    console.log('--- JWT Check: Raw Token ---', token);

    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      
      const payload = JSON.parse(jsonPayload);
      
      console.log('--- Decoded JWT Token Payload ---');
      console.log(payload);
      
      const role = payload['role'] || payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
      console.log('--- Role found: ---', role);
      
      return role === 'Admin' || role === 'SuperAdmin';
    } catch (e) {
      console.error('Error decoding token', e);
      return false;
    }
  });

  register(payload: RegisterRequest): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(
      `${environment.apiUrl}/api/Auth/register`,
      payload
    );
  }

  login(payload: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(
      `${environment.apiUrl}/api/Auth/login`,
      payload
    ).pipe(
      tap(({ token }) => {
        this.tokenStorage.setToken(token);
        this.authenticated.set(true);
      }),
      // After saving the token, fetch the user profile silently
      switchMap((response) =>
        this.userProfileService.loadProfile().pipe(
          // Always return the original login response regardless of profile load result
          tap(() => {}),
          // Map back to the original response so the caller still gets LoginResponse
          switchMap(() => [response])
        )
      )
    );
  }

  forgotPassword(payload: ForgotPasswordRequest): Observable<ForgotPasswordResponse> {
    return this.http.post<ForgotPasswordResponse>(
      `${environment.apiUrl}/api/Auth/forgot-password`,
      payload
    );
  }

  resetPassword(payload: ResetPasswordRequest): Observable<unknown> {
    return this.http.post(
      `${environment.apiUrl}/api/Auth/reset-password`,
      payload
    );
  }

  logout(redirectToLogin = false): void {
    this.tokenStorage.clearToken();
    this.authenticated.set(false);
    this.userProfileService.clearProfile();

    if (redirectToLogin) {
      this.router.navigate(['/auth/login']);
    }
  }

  syncAuthState(): void {
    this.authenticated.set(this.tokenStorage.hasToken());
    // If already logged in (e.g. page refresh), reload the profile
    if (this.tokenStorage.hasToken()) {
      this.userProfileService.loadProfile().subscribe();
    }
  }
}
