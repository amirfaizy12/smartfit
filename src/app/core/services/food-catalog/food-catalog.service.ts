import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class FoodCatalogService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api/FoodCatalog`;

  searchFood(search?: string): Observable<any> {
    let params = new HttpParams();
    if (search) {
      params = params.set('search', search);
    }
    return this.http.get<any>(`${this.baseUrl}/search`, { params });
  }

  getFoodById(id: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${id}`);
  }

  getFoodByCategory(category: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/category/${category}`);
  }

  getCategories(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/categories`);
  }

  createFood(data: any): Observable<any> {
    return this.http.post<any>(this.baseUrl, data);
  }

  updateFood(data: any): Observable<any> {
    return this.http.put<any>(this.baseUrl, data);
  }

  deleteFood(id: string): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/${id}`);
  }
}
