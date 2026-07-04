import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  CaloriesAnalysisResult,
  CaloriesPredictionRequest,
} from '../../models/api.models';
import { extractNumericField } from '../../utils/api-error.util';

@Injectable({ providedIn: 'root' })
export class CaloriesService {
  private readonly http = inject(HttpClient);

  predict(payload: CaloriesPredictionRequest): Observable<CaloriesAnalysisResult> {
    return this.http.post<unknown>(
      `${environment.apiUrl}/api/CaloriesPrediction`,
      payload
    ).pipe(
      map((response) => {
        const calories = extractNumericField(response, [
          'predictedCalories',
          'predictedBurnedCalories',
          'predicted_burned_calories',
          'caloriesBurned',
          'calories',
          'value',
        ]);

        if (calories === null) {
          throw new Error('Calories value was not returned by the server.');
        }

        return {
          calories,
          workoutType: payload.workoutType,
          sessionDurationHours: payload.sessionDurationHours,
          workoutFrequencyDaysWeek: payload.workoutFrequencyDaysWeek,
        };
      })
    );
  }

  getHistory(): Observable<unknown> {
    return this.http.get(`${environment.apiUrl}/api/CaloriesPrediction/my-history`);
  }
}
