import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID, AfterViewInit, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Chart, registerables } from 'chart.js';
import { DashboardService } from '../../core/services/dashboard/dashboard.service';
import { DashboardDto } from '../../core/models/dashboard.models';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  private readonly dashboardService = inject(DashboardService);
  
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  dashboardData: DashboardDto | null = null;
  isLoading = true;
  error = '';
  
  private weightChart!: Chart;

  ngOnInit() {
    this.dashboardService.getDashboard().subscribe({
      next: (response) => {
        // the generic ApiResponse wrapper might be mapped automatically or need extraction
        // Assuming ApiResponse format has `.data` or `.Data`
        const raw = response as any;
        this.dashboardData = raw?.data || raw?.Data || raw;
        this.isLoading = false;
        
        if (isPlatformBrowser(this.platformId)) {
          setTimeout(() => this.buildChart(), 100);
        }
      },
      error: (err) => {
        this.error = 'Failed to load dashboard data.';
        this.isLoading = false;
      }
    });
  }

  ngAfterViewInit() {
    // Chart is built after data is loaded in ngOnInit to ensure DOM element exists
  }

  ngOnDestroy() {
    if (this.weightChart) {
      this.weightChart.destroy();
    }
  }

  private buildChart() {
    const wCtx = document.getElementById('dashWeightChart') as HTMLCanvasElement;
    if (!wCtx || !this.dashboardData?.weightProgress) return;

    const progress = this.dashboardData.weightProgress;
    const labels = progress.map(p => new Date(p.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }));
    const data = progress.map(p => p.weight);

    this.weightChart = new Chart(wCtx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Weight (kg)',
          data: data,
          borderColor: '#1D4ED8', 
          backgroundColor: 'rgba(29,78,216,0.08)',
          fill: true, 
          tension: 0.4, 
          borderWidth: 2,
          pointBackgroundColor: '#1D4ED8', 
          pointBorderColor: '#fff', 
          pointBorderWidth: 2
        }],
      },
      options: {
        responsive: true, 
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { 
          x: { grid: { display: false } }, 
          y: { grid: { color: 'rgba(156,163,175,0.15)' } } 
        }
      },
    });
  }
}
