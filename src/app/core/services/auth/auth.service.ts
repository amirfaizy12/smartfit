import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
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

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly tokenStorage = inject(TokenStorageService);
  private readonly router = inject(Router);

  private readonly authenticated = signal(this.tokenStorage.hasToken());
  readonly isAuthenticated = this.authenticated.asReadonly();

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
      })
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

    if (redirectToLogin) {
      this.router.navigate(['/auth/login']);
    }
  }

  syncAuthState(): void {
    this.authenticated.set(this.tokenStorage.hasToken());
  }
}
