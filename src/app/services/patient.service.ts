import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PatientService {
  private apiUrl = 'http://localhost:4000/api/api/patients';

  constructor(private http: HttpClient) {}

  getPatients(): Observable<any> {
    return this.http.get(this.apiUrl);
  }
}
