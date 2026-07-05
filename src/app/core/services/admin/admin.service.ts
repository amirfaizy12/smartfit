import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  AdminDashboardStats,
  AdminUserDto,
  AdminBmiLog,
  AdminCaloriesLog,
  AdminDietLog,
  AdminExerciseLog,
} from '../../models/admin.models';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api/Admin`;

  // ── Dashboard Statistics ────────────────────────────────────────────
  getDashboardStatistics(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/dashboard/statistics`);
  }

  // ── Users ───────────────────────────────────────────────────────────
  getUsers(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/users`);
  }

  getUserById(id: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/users/${id}`);
  }

  disableUser(id: string): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/users/${id}/disable`, {});
  }

  enableUser(id: string): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/users/${id}/enable`, {});
  }

  // ── Reports ─────────────────────────────────────────────────────────
  getUserReport(userId: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/reports/user/${userId}`);
  }

  // ── Logs ────────────────────────────────────────────────────────────
  getBmiLogs(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/logs/bmi`);
  }

  getCaloriesLogs(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/logs/calories`);
  }

  getDietLogs(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/logs/diets`);
  }

  getExerciseLogs(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/logs/exercises`);
  }

  // ── Exports ─────────────────────────────────────────────────────────
  exportUsers(): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/export/users`, { responseType: 'blob' });
  }

  exportBmi(): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/export/bmi`, { responseType: 'blob' });
  }

  exportWorkouts(): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/export/workouts`, { responseType: 'blob' });
  }
}
