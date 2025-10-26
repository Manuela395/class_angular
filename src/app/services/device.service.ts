import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DeviceService {
  private apiUrl = 'http://localhost:4000/api/devices';

  constructor(private http: HttpClient) {}

  getDevices(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  createDevice(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  updateDevice(id: string, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }

  deleteDevice(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
