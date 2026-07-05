import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, switchMap, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { CompleteProfileRequest, CreateProfileRequest } from '../../models/api.models';

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api/Profile`;

  getProfile(): Observable<unknown> {
    return this.http.get(this.baseUrl);
  }

  createProfile(payload: CreateProfileRequest): Observable<unknown> {
    return this.http.post(this.baseUrl, payload, { responseType: 'text' });
  }

  updateProfile(payload: CreateProfileRequest): Observable<unknown> {
    return this.http.put(this.baseUrl, payload, { responseType: 'text' });
  }

  upsertProfile(payload: CreateProfileRequest): Observable<unknown> {
    return this.getProfile().pipe(
      switchMap(() => this.updateProfile(payload)),
      catchError((error) => {
        if (error.status === 404) {
          return this.createProfile(payload);
        }

        return throwError(() => error);
      })
    );
  }

  completeProfile(payload: CompleteProfileRequest): Observable<unknown> {
    return this.http.post(`${this.baseUrl}/complete-profile`, payload, { responseType: 'text' });
  }
}
