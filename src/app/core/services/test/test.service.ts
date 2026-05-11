import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TestService {

  constructor(private readonly httpClient: HttpClient) { }
  testapi(): Observable<any> {
    return this.httpClient.post(
      'https://web-production-9a7c5.up.railway.app/predict',
      {
        "Sex": "male",
        "Height_cm": 175,
        "Age": 21,
        "Weight_kg": 95
      }
    )
  }
}
