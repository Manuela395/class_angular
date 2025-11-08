import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class EcgReadingsService {
  private apiUrl = 'http://localhost:4000/api/ecg-readings';
  private ecgApiUrl = 'http://localhost:4000/api/ecg';

  constructor(private http: HttpClient) {}

  getReadings(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  getReadingById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  createReading(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}`, data);
  }

  updateReading(id: string, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }

  deleteReading(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  // Obtener pacientes con sesiones ECG activas
  getPatientsWithActiveSessions(): Observable<any> {
    return this.http.get(`${this.apiUrl}/patients-active`);
  }

  // Obtener datos ECG en tiempo real desde el servidor Python
  getLiveECGData(deviceId: string, seconds: number = 5): Observable<any> {
    const params = new HttpParams()
      .set('device_id', deviceId)
      .set('seconds', seconds.toString());
    return this.http.get(`${this.ecgApiUrl}/live`, { params });
  }
}

