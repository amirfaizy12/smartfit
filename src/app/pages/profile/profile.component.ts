import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID, AfterViewInit } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-profile',
  imports: [CommonModule, RouterLink],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements AfterViewInit, OnDestroy {
  constructor(@Inject(PLATFORM_ID) private platformId: Object, private router: Router) { }
  private chart!: Chart;
  activeTab: '7D' | '30D' | '1Y' = '30D';

  // ✅ Array للـ tabs عشان @for
  tabs: Array<'7D' | '30D' | '1Y'> = ['7D', '30D', '1Y'];

  user = {
    name: 'Marcus Thorne',
    badge: 'Elite Performance',
    bio: 'Breaking plateaus through data-driven intensity and metabolic optimization. Dedicated to the 1% club.',
    avatar: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=200&h=200&fit=crop&auto=format',
  };

  stats = [
    { icon: 'fa-solid fa-dumbbell', label: 'Workouts', value: '342', unit: '', sub: '+12 this month', subColor: 'text-green-500' },
    { icon: 'fa-solid fa-bolt', label: 'Current Streak', value: '18', unit: 'Days', sub: 'Personal Best: 45', subColor: 'text-gray-400' },
    { icon: 'fa-solid fa-weight-scale', label: 'Current Weight', value: '88.5', unit: 'kg', sub: '-2.4kg from start', subColor: 'text-blue-500' },
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

  private weightData: Record<string, { labels: string[]; data: number[] }> = {
    '7D': { labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], data: [89.2, 89.0, 88.8, 88.9, 88.6, 88.5, 88.5] },
    '30D': { labels: ['WK1', 'WK2', 'WK3', 'WK4'], data: [90.1, 89.5, 89.0, 88.5] },
    '1Y': { labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], data: [92, 91.5, 91, 90.5, 90, 89.5, 89.2, 89, 88.8, 88.6, 88.5, 88.5] },
  };

  private calData: Record<string, { labels: string[]; data: number[] }> = {
    '7D': { labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], data: [420, 0, 540, 310, 640, 480, 0] },
    '30D': { labels: ['WK1', 'WK2', 'WK3', 'WK4'], data: [1800, 2100, 1950, 2300] },
    '1Y': { labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], data: [12000, 13500, 14200, 13800, 15000, 14600, 15200, 14900, 15500, 16000, 15300, 16200] },
  };

  private weightChart!: Chart;
  private calChart!: Chart;
  activeWeightTab: '7D' | '30D' | '1Y' = '7D';
  activeCalTab: '7D' | '30D' | '1Y' = '7D';

  // في buildChart() بدّلها بـ:
  private buildChart() {
    const wCtx = document.getElementById('weightChart') as HTMLCanvasElement;
    const cCtx = document.getElementById('calChart') as HTMLCanvasElement;
    if (!wCtx || !cCtx) return;

    this.weightChart = new Chart(wCtx, {
      type: 'line',
      data: {
        labels: this.weightData['7D'].labels,
        datasets: [{
          label: 'Weight (kg)', data: this.weightData['7D'].data,
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
    this.weightChart.data.labels = this.weightData[tab].labels;
    this.weightChart.data.datasets[0].data = this.weightData[tab].data;
    this.weightChart.update();
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
    // ✅ بيشتغل بس لو في المتصفح
    if (isPlatformBrowser(this.platformId)) {
      this.buildChart();
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
      this.user = {
        ...this.user,
        avatar: reader.result as string  // ✅ بيحدث الصورة فوراً
      };
    };

    reader.readAsDataURL(file);
  }
  logout() {
    // API هنا
    this.router.navigate(['/auth/login']);
  }
}