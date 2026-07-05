import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { DashboardDto } from '../../models/dashboard.models';
import { ApiResponse } from '../../models/api.models';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api/Dashboard`;

  getDashboard(): Observable<ApiResponse<DashboardDto>> {
    return this.http.get<ApiResponse<DashboardDto>>(this.baseUrl);
  }
}
