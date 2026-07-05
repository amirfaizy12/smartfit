import { Component, OnInit, AfterViewInit, OnDestroy, inject, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Chart, registerables } from 'chart.js';
import { forkJoin } from 'rxjs';
import { AdminService } from '../../../../core/services/admin/admin.service';

Chart.register(...registerables);

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-dashboard.component.html',
})
export class AdminDashboardComponent implements OnInit, AfterViewInit, OnDestroy {

  private readonly adminService = inject(AdminService);
  private readonly isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  // ── Loading / Error ────────────────────────────────────────────────
  isLoading = true;
  hasError = false;
  errorMessage = '';

  // ── Stats cards ────────────────────────────────────────────────────
  stats = {
    totalUsers: 0,
    totalWorkouts: 0,
    totalBMIAnalyses: 0,
    totalCaloriesPredictions: 0,
    totalDietRecommendations: 0,
    totalExerciseRecommendations: 0,
  };

  // ── Users list ─────────────────────────────────────────────────────
  users: any[] = [];
  filteredUsers: any[] = [];
  searchTerm = '';
  userCurrentPage = 1;
  usersPerPage = 8;

  // ── Recent activity (BMI logs) ─────────────────────────────────────
  bmiLogs: any[] = [];
  caloriesLogs: any[] = [];

  // ── Charts ─────────────────────────────────────────────────────────
  private userGrowthChart!: Chart;
  private bmiDistributionChart!: Chart;

  // ── Tab for users table ────────────────────────────────────────────
  activeTab: 'users' | 'bmi' | 'calories' = 'users';

  // ──────────────────────────────────────────────────────────────────

  ngOnInit(): void {
    this.loadDashboardData();
  }

  ngAfterViewInit(): void {
    // Charts will be built after data loads
  }

  ngOnDestroy(): void {
    this.userGrowthChart?.destroy();
    this.bmiDistributionChart?.destroy();
  }

  // ── Data fetching ──────────────────────────────────────────────────

  loadDashboardData(): void {
    this.isLoading = true;
    this.hasError = false;

    forkJoin({
      stats: this.adminService.getDashboardStatistics(),
      users: this.adminService.getUsers(),
      bmiLogs: this.adminService.getBmiLogs(),
      caloriesLogs: this.adminService.getCaloriesLogs(),
    }).subscribe({
      next: (result) => {
        this.processStats(result.stats);
        this.processUsers(result.users);
        this.processBmiLogs(result.bmiLogs);
        this.processCaloriesLogs(result.caloriesLogs);
        this.isLoading = false;

        // Build charts after data is ready
        if (this.isBrowser) {
          setTimeout(() => this.buildCharts(), 100);
        }
      },
      error: (err) => {
        console.error('Admin dashboard error:', err);
        this.hasError = true;
        this.errorMessage = err?.error?.message || err?.message || 'Failed to load dashboard data.';
        this.isLoading = false;
      },
    });
  }

  // ── Data processors (handle flexible API response shapes) ──────────

  private processStats(raw: any): void {
    const data = raw?.data || raw?.Data || raw || {};
    this.stats = {
      totalUsers: data.totalUsers ?? data.TotalUsers ?? 0,
      totalWorkouts: data.totalWorkouts ?? data.TotalWorkouts ?? 0,
      totalBMIAnalyses: data.totalBMIAnalyses ?? data.TotalBMIAnalyses ?? data.totalBmiAnalyses ?? 0,
      totalCaloriesPredictions: data.totalCaloriesPredictions ?? data.TotalCaloriesPredictions ?? 0,
      totalDietRecommendations: data.totalDietRecommendations ?? data.TotalDietRecommendations ?? 0,
      totalExerciseRecommendations: data.totalExerciseRecommendations ?? data.TotalExerciseRecommendations ?? 0,
    };
  }

  private processUsers(raw: any): void {
    const data = raw?.data || raw?.Data || raw || [];
    this.users = Array.isArray(data) ? data : [];
    this.filteredUsers = [...this.users];
  }

  private processBmiLogs(raw: any): void {
    const data = raw?.data || raw?.Data || raw || [];
    this.bmiLogs = Array.isArray(data) ? data : [];
  }

  private processCaloriesLogs(raw: any): void {
    const data = raw?.data || raw?.Data || raw || [];
    this.caloriesLogs = Array.isArray(data) ? data : [];
  }

  // ── Search / Filter ────────────────────────────────────────────────

  onSearch(): void {
    const term = this.searchTerm.toLowerCase().trim();
    this.userCurrentPage = 1;
    if (!term) {
      this.filteredUsers = [...this.users];
      return;
    }
    this.filteredUsers = this.users.filter(u => {
      const name = (u.fullName || u.FullName || u.userName || u.email || '').toLowerCase();
      const email = (u.email || u.Email || '').toLowerCase();
      return name.includes(term) || email.includes(term);
    });
  }

  // ── Pagination ─────────────────────────────────────────────────────

  get pagedUsers(): any[] {
    const start = (this.userCurrentPage - 1) * this.usersPerPage;
    return this.filteredUsers.slice(start, start + this.usersPerPage);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredUsers.length / this.usersPerPage) || 1;
  }

  prevPage(): void {
    if (this.userCurrentPage > 1) this.userCurrentPage--;
  }

  nextPage(): void {
    if (this.userCurrentPage < this.totalPages) this.userCurrentPage++;
  }

  // ── Toggle user enable/disable ────────────────────────────────────

  toggleUser(user: any): void {
    const id = user.id || user.Id || user.userId;
    if (!id) return;

    const isCurrentlyDisabled = user.isDisabled ?? user.IsDisabled ?? false;
    const action$ = isCurrentlyDisabled
      ? this.adminService.enableUser(id)
      : this.adminService.disableUser(id);

    action$.subscribe({
      next: () => {
        user.isDisabled = !isCurrentlyDisabled;
        user.IsDisabled = !isCurrentlyDisabled;
      },
      error: (err: any) => {
        console.error('Toggle user failed:', err);
        alert('Failed to update user status.');
      },
    });
  }

  // ── Export ──────────────────────────────────────────────────────────

  exportUsers(): void {
    this.adminService.exportUsers().subscribe({
      next: (blob) => this.downloadFile(blob, 'users_export.xlsx'),
      error: () => alert('Export failed.'),
    });
  }

  exportBmi(): void {
    this.adminService.exportBmi().subscribe({
      next: (blob) => this.downloadFile(blob, 'bmi_export.xlsx'),
      error: () => alert('Export failed.'),
    });
  }

  exportWorkouts(): void {
    this.adminService.exportWorkouts().subscribe({
      next: (blob) => this.downloadFile(blob, 'workouts_export.xlsx'),
      error: () => alert('Export failed.'),
    });
  }

  private downloadFile(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  // ── Helpers ────────────────────────────────────────────────────────

  getInitials(user: any): string {
    const name = user.fullName || user.FullName || user.userName || user.email || '??';
    return name
      .split(' ')
      .map((w: string) => w.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  getUserName(user: any): string {
    return user.fullName || user.FullName || user.userName || user.email || 'Unknown';
  }

  getUserEmail(user: any): string {
    return user.email || user.Email || '—';
  }

  getUserDate(user: any): string {
    const d = user.createdAt || user.CreatedAt || user.registeredAt || user.RegisteredAt;
    if (!d) return '—';
    try {
      return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return d;
    }
  }

  isUserDisabled(user: any): boolean {
    return user.isDisabled ?? user.IsDisabled ?? false;
  }

  // ── Charts ─────────────────────────────────────────────────────────

  private buildCharts(): void {
    this.buildUserGrowthChart();
    this.buildBmiDistributionChart();
  }

  private buildUserGrowthChart(): void {
    const ctx = document.getElementById('userGrowthChart') as HTMLCanvasElement;
    if (!ctx) return;

    // Group users by month of creation
    const monthCounts: Record<string, number> = {};
    this.users.forEach(u => {
      const d = u.createdAt || u.CreatedAt || u.registeredAt;
      if (!d) return;
      try {
        const date = new Date(d);
        const key = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
        monthCounts[key] = (monthCounts[key] || 0) + 1;
      } catch { }
    });

    const labels = Object.keys(monthCounts);
    const data = Object.values(monthCounts);

    // If no data, show a placeholder
    if (labels.length === 0) {
      labels.push('No data');
      data.push(0);
    }

    this.userGrowthChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'New Users',
          data,
          borderColor: '#4f46e5',
          backgroundColor: 'rgba(79, 70, 229, 0.08)',
          fill: true,
          tension: 0.4,
          borderWidth: 2.5,
          pointBackgroundColor: '#4f46e5',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 4,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: '#9ca3af', font: { size: 11 } }
          },
          y: {
            beginAtZero: true,
            grid: { color: 'rgba(156,163,175,0.1)' },
            ticks: { color: '#9ca3af', font: { size: 11 }, stepSize: 1 }
          },
        },
      },
    });
  }

  private buildBmiDistributionChart(): void {
    const ctx = document.getElementById('bmiDistributionChart') as HTMLCanvasElement;
    if (!ctx) return;

    // Group BMI logs by bodyType
    const typeCounts: Record<string, number> = {};
    this.bmiLogs.forEach(log => {
      const type = log.bodyType || log.BodyType || log.healthStatus || 'Unknown';
      typeCounts[type] = (typeCounts[type] || 0) + 1;
    });

    const labels = Object.keys(typeCounts);
    const data = Object.values(typeCounts);

    const colors = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#3b82f6', '#a855f7'];

    if (labels.length === 0) {
      labels.push('No data');
      data.push(0);
    }

    this.bmiDistributionChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: colors.slice(0, labels.length),
          borderWidth: 0,
          hoverOffset: 8,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '65%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: { color: '#6b7280', font: { size: 11 }, padding: 16, usePointStyle: true, pointStyle: 'circle' },
          },
        },
      },
    });
  }
}