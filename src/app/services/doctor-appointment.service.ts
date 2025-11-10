import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DoctorAppointmentService {
  private apiUrl = 'http://localhost:4000/api/doctor-appointments';

  constructor(private http: HttpClient) {}

  getAppointments(): Observable<any> {
    //console.log('DoctorAppointmentService: Making request to:', this.apiUrl);
    return this.http.get(this.apiUrl);
  }
}