import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AppointmentService {
  private apiUrl = 'http://localhost:4000/api/appointments';

  constructor(private http: HttpClient) {}

  getAppointments(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  createAppointment(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, data);
  }

  updateAppointment(id: string, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }

  deleteAppointment(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  getAppointmentById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }
}

