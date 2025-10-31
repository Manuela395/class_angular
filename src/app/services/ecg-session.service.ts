import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class EcgSessionService {
  private apiUrl = 'http://localhost:4000/api/ecg-sessions';

  constructor(private http: HttpClient) {}

  getSessions(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  getSessionById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  createSession(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  deleteSession(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  updateSession(id: string, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }
}
