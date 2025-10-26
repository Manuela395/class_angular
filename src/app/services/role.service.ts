import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class RoleService {
  private apiUrl = 'http://localhost:4000/api/roles';

  constructor(private http: HttpClient) {}

  getRoles(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  createRole(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  updateRole(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }

  deleteRole(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
