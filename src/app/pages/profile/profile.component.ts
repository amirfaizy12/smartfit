import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID, AfterViewInit, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Chart, registerables } from 'chart.js';
import { AuthService } from '../../core/services/auth/auth.service';
import { UserProfileService } from '../../core/services/profile/user-profile.service';
import { DashboardService } from '../../core/services/dashboard/dashboard.service';
import { DashboardDto } from '../../core/models/dashboard.models';

Chart.register(...registerables);

@Component({
  selector: 'app-profile',
  imports: [CommonModule, RouterLink],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements AfterViewInit, OnDestroy {
  private readonly authService = inject(AuthService);
  private readonly userProfileService = inject(UserProfileService);
  private readonly dashboardService = inject(DashboardService);

  constructor(@Inject(PLATFORM_ID) private platformId: Object, private router: Router) { }
  private chart!: Chart;
  activeTab: '7D' | '30D' | '1Y' = '30D';

  // ✅ Array للـ tabs عشان @for
  tabs: Array<'7D' | '30D' | '1Y'> = ['7D', '30D', '1Y'];

  // ── Dynamic profile from the API ────────────────────────────
  readonly displayName = this.userProfileService.displayName;
  readonly avatarUrl   = this.userProfileService.avatarUrl;
  readonly profile     = this.userProfileService.profile;

  dashboardData: DashboardDto | null = null;

  stats = [
    { icon: 'fa-solid fa-dumbbell', label: 'Workouts', value: '0', unit: '', sub: '', subColor: 'text-green-500' },
    { icon: 'fa-solid fa-bolt', label: 'BMI Analyses', value: '0', unit: '', sub: '', subColor: 'text-gray-400' },
    { icon: 'fa-solid fa-weight-scale', label: 'Current Weight', value: '--', unit: 'kg', sub: '', subColor: 'text-blue-500' },
  ];

  badges = [
    { icon: 'fa-solid fa-sun', label: 'Early Bird', color: 'text-yellow-400' },
    { icon: 'fa-solid fa-trophy', label: 'Champion', color: 'text-purple-400' },
    { icon: 'fa-solid fa-fire', label: 'On Fire', color: 'text-orange-400' },
  ];

  logs = [
    { icon: 'fa-solid fa-person-running', name: 'Evening Intervals', date: 'Yesterday, 6:45 PM', duration: '45 mins', kcal: 640, tag: 'New PR' },
    { icon: 'fa-solid fa-dumbbell', name: 'Upper Body Power', date: 'Oct 24, 2023', duration: '1h 15m', kcal: 420, tag: 'Standard' },
    { icon: 'fa-solid fa-person-running', name: 'Morning Run', date: 'Oct 23, 2023', duration: '30 mins', kcal: 310, tag: 'Standard' },
  ];

  private weightChart!: Chart;
  private calChart!: Chart;
  activeWeightTab: '7D' | '30D' | '1Y' = '7D';
  activeCalTab: '7D' | '30D' | '1Y' = '7D';

  // Fallback static data for calories chart
  private calData: Record<string, { labels: string[]; data: number[] }> = {
    '7D': { labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], data: [420, 0, 540, 310, 640, 480, 0] },
    '30D': { labels: ['WK1', 'WK2', 'WK3', 'WK4'], data: [1800, 2100, 1950, 2300] },
    '1Y': { labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], data: [12000, 13500, 14200, 13800, 15000, 14600, 15200, 14900, 15500, 16000, 15300, 16200] },
  };

  private buildChart() {
    const wCtx = document.getElementById('weightChart') as HTMLCanvasElement;
    const cCtx = document.getElementById('calChart') as HTMLCanvasElement;
    if (!wCtx || !cCtx) return;

    // Build weight chart from dashboard data (live) or show placeholder
    const weightProgress = this.dashboardData?.weightProgress || [];
    let wLabels: string[];
    let wData: number[];

    if (weightProgress.length > 0) {
      wLabels = weightProgress.map(p => new Date(p.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }));
      wData = weightProgress.map(p => p.weight);
    } else {
      // Show current weight as single point if available
      const cw = this.dashboardData?.currentWeight || this.profile()?.weight;
      wLabels = ['Now'];
      wData = cw ? [cw] : [0];
    }

    this.weightChart = new Chart(wCtx, {
      type: 'line',
      data: {
        labels: wLabels,
        datasets: [{
          label: 'Weight (kg)', data: wData,
          borderColor: '#1D4ED8', backgroundColor: 'rgba(29,78,216,0.08)',
          fill: true, tension: 0.4, borderWidth: 2,
          pointBackgroundColor: '#1D4ED8', pointBorderColor: '#fff', pointBorderWidth: 2
        }],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { x: { grid: { display: false } }, y: { grid: { color: 'rgba(156,163,175,0.15)' } } }
      },
    });

    this.calChart = new Chart(cCtx, {
      type: 'bar',
      data: {
        labels: this.calData['7D'].labels,
        datasets: [{
          label: 'Calories (kcal)', data: this.calData['7D'].data,
          backgroundColor: 'rgba(245,158,11,0.8)', borderRadius: 6, barPercentage: 0.5
        }],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { x: { grid: { display: false } }, y: { grid: { color: 'rgba(156,163,175,0.15)' } } }
      },
    });
  }

  switchWeightTab(tab: '7D' | '30D' | '1Y') {
    this.activeWeightTab = tab;
    // Weight chart is now live from API, tab switching is a no-op unless we have 
    // enough history to filter. For now just keep the chart as is.
  }

  switchCalTab(tab: '7D' | '30D' | '1Y') {
    this.activeCalTab = tab;
    this.calChart.data.labels = this.calData[tab].labels;
    this.calChart.data.datasets[0].data = this.calData[tab].data;
    this.calChart.update();
  }

  ngOnDestroy() {
    this.weightChart?.destroy();
    this.calChart?.destroy();
  }

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      // Fetch dashboard data to get live stats and weight progress
      this.dashboardService.getDashboard().subscribe({
        next: (response) => {
          const raw = response as any;
          this.dashboardData = raw?.data || raw?.Data || raw;

          // Update stats from API
          if (this.dashboardData) {
            this.stats[0].value = String(this.dashboardData.statistics?.totalWorkouts ?? 0);
            this.stats[1].value = String(this.dashboardData.statistics?.totalBMIAnalyses ?? 0);
            this.stats[2].value = String(this.dashboardData.currentWeight ?? '--');
          }

          this.buildChart();
        },
        error: () => {
          // Fallback: build chart with whatever we have
          this.buildChart();
        }
      });
    }
  }

  onImageSelected(event: Event) {
    const input = event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];

    // ✅ تأكد إن الملف صورة
    if (!file.type.startsWith('image/')) return;

    const reader = new FileReader();

    reader.onload = () => {
      // Update the avatar in the shared profile signal
      this.userProfileService.patchProfile({ profilePictureUrl: reader.result as string });
    };

    reader.readAsDataURL(file);
  }
  logout() {
    this.authService.logout(true);
  }
}