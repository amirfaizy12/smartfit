import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../../../core/services/auth/auth.service';
import { UserProfileService } from '../../../../core/services/profile/user-profile.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="flex h-screen bg-gray-50 overflow-hidden font-sans">
      
      <!-- Sidebar -->
      <aside class="w-64 bg-white border-r border-gray-200 flex flex-col hidden md:flex">
        <!-- Logo -->
        <div class="h-16 flex items-center px-6 border-b border-gray-100">
          <span class="text-blue-600 font-bold text-xl tracking-tight">SmartFit Admin</span>
        </div>

        <!-- Nav Links -->
        <nav class="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          <a routerLink="/admin/dashboard" routerLinkActive="bg-blue-50 text-blue-700"
             class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors">
            <i class="fa-solid fa-chart-pie w-5 text-center"></i>
            Dashboard
          </a>
          
          <div class="pt-4 pb-2">
            <p class="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Content Management</p>
          </div>
          
          <a routerLink="/admin/exercises" routerLinkActive="bg-blue-50 text-blue-700"
             class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors">
            <i class="fa-solid fa-dumbbell w-5 text-center"></i>
            Exercises
          </a>
          <a routerLink="/admin/food-catalog" routerLinkActive="bg-blue-50 text-blue-700"
             class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors">
            <i class="fa-solid fa-apple-whole w-5 text-center"></i>
            Food Catalog
          </a>
        </nav>

        <!-- Profile / Logout -->
        <div class="p-4 border-t border-gray-100">
          <div class="flex items-center gap-3 px-3 py-2">
            <img [src]="avatarUrl()" alt="Admin" class="w-9 h-9 rounded-full object-cover border border-gray-200">
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-900 truncate">{{ displayName() }}</p>
              <p class="text-xs text-gray-500 truncate">Administrator</p>
            </div>
          </div>
          <button (click)="logout()" class="mt-2 w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors">
            <i class="fa-solid fa-right-from-bracket"></i> Logout
          </button>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="flex-1 flex flex-col h-screen overflow-hidden">
        
        <!-- Mobile Header -->
        <header class="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:hidden">
          <span class="text-blue-600 font-bold text-lg">SmartFit Admin</span>
          <button class="text-gray-500 hover:text-gray-900 focus:outline-none">
            <i class="fa-solid fa-bars text-xl"></i>
          </button>
        </header>

        <!-- Top Header for Desktop -->
        <header class="hidden md:flex h-16 bg-white border-b border-gray-200 items-center justify-between px-8">
          <div class="flex items-center bg-gray-100 rounded-full px-4 py-2 w-96">
            <i class="fa-solid fa-search text-gray-400 text-sm"></i>
            <input type="text" placeholder="Search users, exercises..." class="bg-transparent border-none focus:ring-0 text-sm w-full ml-2 outline-none">
          </div>
          
          <div class="flex items-center gap-4">
            <a routerLink="/home" class="text-sm text-blue-600 hover:underline font-medium">View Website</a>
            <button class="relative text-gray-500 hover:text-blue-600 transition-colors">
              <i class="fa-regular fa-bell text-xl"></i>
              <span class="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
          </div>
        </header>

        <!-- Page Content -->
        <div class="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <router-outlet></router-outlet>
        </div>

      </main>
    </div>
  `
})
export class AdminLayoutComponent {
  private authService = inject(AuthService);
  private userProfileService = inject(UserProfileService);
  
  readonly displayName = this.userProfileService.displayName;
  readonly avatarUrl = this.userProfileService.avatarUrl;

  logout() {
    this.authService.logout(true);
  }
}
