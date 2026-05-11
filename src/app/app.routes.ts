
import { Component } from '@angular/core';
import { Routes } from '@angular/router';
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';

export const routes: Routes = [
    {
        path: 'auth', component: AuthLayoutComponent, children: [
            { path: 'login', loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent), title: 'Login' },
            { path: 'register', loadComponent: () => import('./pages/register/register.component').then(m => m.RegisterComponent), title: 'Register' },
            {
                path: 'forgot-password', loadComponent: () => import('./pages/forgot-password/forgot-password/forgot-password.component')
                    .then(m => m.ForgotPasswordComponent),
                title: 'Forgot Password'
            },
            {
                path: 'verify-code',
                loadComponent: () =>
                    import('./pages/verify-code/verify-code/verify-code.component')
                        .then(m => m.VerifyCodeComponent),
                title: 'Verify Code'
            },

            {
                path: 'reset-password',
                loadComponent: () =>
                    import('./pages/repass/repass/repass.component')
                        .then(m => m.RepassComponent),
                title: 'Reset Password'
            }
        ]
    },
    {
        path: '', component: MainLayoutComponent, children: [
            { path: '', redirectTo: 'home', pathMatch: 'full' },
            { path: 'home', loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent), title: 'Home' },
            { path: 'ai', loadComponent: () => import('./pages/ai/ai.component').then(m => m.AiComponent), title: 'AI' },
            { path: 'profile', loadComponent: () => import('./pages/profile/profile.component').then(m => m.ProfileComponent), title: 'Profile'  },
             {path: 'edite-Profile' , loadComponent: ()=> import('./pages/edit-profile/edit-profile.component').then(c =>c.EditProfileComponent ) , title: "Edite Profile"},
            { path: 'dashboard', loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent), title: 'Dashboard' },
            { path: 'contact', loadComponent: () => import('./pages/contact/contact.component').then(m => m.ContactComponent), title: 'Contact' },
        ]
    },
    { path: '**', loadComponent: () => import('./pages/notfound/notfound.component').then(m => m.NotfoundComponent), title: 'Not Found' },

];
