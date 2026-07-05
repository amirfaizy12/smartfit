import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ExercisesService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api/Exercises`;

  getExercises(
    search?: string,
    goal?: string,
    equipment?: string,
    level?: string,
    pageNumber: number = 1,
    pageSize: number = 50
  ): Observable<any> {
    let params = new HttpParams()
      .set('PageNumber', pageNumber.toString())
      .set('PageSize', pageSize.toString());

    if (search) params = params.set('Search', search);
    if (goal) params = params.set('Goal', goal);
    if (equipment) params = params.set('Equipment', equipment);
    if (level) params = params.set('Level', level);

    return this.http.get<any>(this.baseUrl, { params });
  }

  getExerciseById(id: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${id}`);
  }

  createExercise(data: any): Observable<any> {
    return this.http.post<any>(this.baseUrl, data);
  }

  updateExercise(id: string, data: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/${id}`, data);
  }

  deleteExercise(id: string): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/${id}`);
  }

  activateExercise(id: string): Observable<any> {
    return this.http.patch<any>(`${this.baseUrl}/${id}/activate`, {});
  }

  deactivateExercise(id: string): Observable<any> {
    return this.http.patch<any>(`${this.baseUrl}/${id}/deactivate`, {});
  }

  getCategories(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/categories`);
  }
}
