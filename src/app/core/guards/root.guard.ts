import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';

export const rootGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // If user is logged in and is an Admin, redirect them directly to the admin dashboard
  if (authService.isAuthenticated() && authService.isAdmin()) {
    return router.createUrlTree(['/admin/dashboard']);
  }

  // Otherwise, default users and guests go to the home page
  return router.createUrlTree(['/home']);
};
