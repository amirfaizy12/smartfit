import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { TokenStorageService } from '../services/auth/token-storage.service';

const PUBLIC_AUTH_PATHS = [
  '/api/Auth/register',
  '/api/Auth/login',
  '/api/Auth/forgot-password',
  '/api/Auth/reset-password',
];

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenStorage = inject(TokenStorageService);
  const isPublicAuthRequest = PUBLIC_AUTH_PATHS.some((path) => req.url.includes(path));

  if (isPublicAuthRequest) {
    return next(req);
  }

  const token = tokenStorage.getToken();

  if (!token) {
    return next(req);
  }

  return next(
    req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    })
  );
};
