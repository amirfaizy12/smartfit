
import { Routes } from '@angular/router';
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';
import { adminGuard } from './core/guards/admin.guard';
import { rootGuard } from './core/guards/root.guard';

export const routes: Routes = [
    {
        path: 'auth', component: AuthLayoutComponent, children: [
            {
                path: 'login',
                canActivate: [guestGuard],
                loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent),
                title: 'Login'
            },
            {
                path: 'register',
                canActivate: [guestGuard],
                loadComponent: () => import('./pages/register/register.component').then(m => m.RegisterComponent),
                title: 'Register'
            },
            {
                path: 'forgot-password',
                canActivate: [guestGuard],
                loadComponent: () => import('./pages/forgot-password/forgot-password/forgot-password.component')
                    .then(m => m.ForgotPasswordComponent),
                title: 'Forgot Password'
            },
            {
                path: 'verify-code',
                canActivate: [guestGuard],
                loadComponent: () =>
                    import('./pages/verify-code/verify-code/verify-code.component')
                        .then(m => m.VerifyCodeComponent),
                title: 'Verify Code'
            },
            {
                path: 'reset-password',
                canActivate: [guestGuard],
                loadComponent: () =>
                    import('./pages/repass/repass/repass.component')
                        .then(m => m.RepassComponent),
                title: 'Reset Password'
            }
        ]
    },
    {
        path: '', component: MainLayoutComponent, children: [
            { path: '', children: [], canActivate: [rootGuard], pathMatch: 'full' },
            {
                path: 'home',
                loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent),
                title: 'Home'
            },
            {
                path: 'ai',
                canActivate: [authGuard],
                loadComponent: () => import('./pages/ai/ai.component').then(m => m.AiComponent),
                title: 'AI'
            },
            {
                path: 'profile',
                canActivate: [authGuard],
                loadComponent: () => import('./pages/profile/profile.component').then(m => m.ProfileComponent),
                title: 'Profile'
            },
            {
                path: 'edite-Profile',
                canActivate: [authGuard],
                loadComponent: () => import('./pages/edit-profile/edit-profile.component').then(c => c.EditProfileComponent),
                title: 'Edit Profile'
            },
            {
                path: 'dashboard',
                canActivate: [authGuard],
                loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent),
                title: 'Dashboard'
            },
            {
                path: 'contact',
                loadComponent: () => import('./pages/contact/contact.component').then(m => m.ContactComponent),
                title: 'Contact'
            },
        ]
    },
    {
        path: 'admin',
        canActivate: [authGuard, adminGuard],
        loadComponent: () => import('./pages/admin/layout/admin-layout/admin-layout.component').then(m => m.AdminLayoutComponent),
        children: [
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
            {
                path: 'dashboard',
                loadComponent: () => import('./pages/admin/dashboard/admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent),
                title: 'Admin Dashboard'
            },
            {
                path: 'exercises',
                loadComponent: () => import('./pages/admin/exercises/admin-exercises/admin-exercises.component').then(m => m.AdminExercisesComponent),
                title: 'Manage Exercises'
            },
            {
                path: 'food-catalog',
                loadComponent: () => import('./pages/admin/food-catalog/admin-food-catalog/admin-food-catalog.component').then(m => m.AdminFoodCatalogComponent),
                title: 'Manage Food Catalog'
            }
        ]
    },
    { path: '**', loadComponent: () => import('./pages/notfound/notfound.component').then(m => m.NotfoundComponent), title: 'Not Found' },

];
