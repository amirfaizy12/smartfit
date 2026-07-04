import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { BmiAnalysisResult } from '../../models/api.models';
import { extractNumericField, extractStringField } from '../../utils/api-error.util';

@Injectable({ providedIn: 'root' })
export class BmiService {
  private readonly http = inject(HttpClient);

  predict(): Observable<BmiAnalysisResult> {
    return this.http.post<unknown>(
      `${environment.apiUrl}/api/BMI/predict`,
      {}
    ).pipe(
      map((response) => {
        const bmi = extractNumericField(response, [
          'predictedBmi',
          'predicted_bmi',
          'bmi',
          'currentBMI',
          'value',
        ]);

        if (bmi === null) {
          throw new Error('BMI value was not returned by the server.');
        }

        return {
          bmi,
          bodyType: extractStringField(response, ['bodyType', 'BodyType', 'type']),
          healthStatus: extractStringField(response, ['healthStatus', 'HealthStatus', 'status']),
        };
      })
    );
  }

  getHistory(): Observable<unknown> {
    return this.http.get(`${environment.apiUrl}/api/BMI/history`);
  }
}
