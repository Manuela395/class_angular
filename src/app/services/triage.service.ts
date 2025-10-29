import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TriageService {
  private apiUrl = 'http://localhost:4000/api/clinicals';

  constructor(private http: HttpClient) {}

  getTriages(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  getTriageById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  createTriage(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, data);
  }

  updateTriage(id: string, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }

  deleteTriage(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}

