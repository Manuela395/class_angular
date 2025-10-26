import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { LoginRequest, LoginResponse, User } from '../models/user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private API_URL = 'http://localhost:4000/api';
  private _user$ = new BehaviorSubject<User | null>(this.getUserFromStorage());

  user$ = this._user$.asObservable();

  get token(): string | null {
    return localStorage.getItem('token');
  }

  get isLoggedIn(): boolean {
    return !!this.token;
  }

  login(payload: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.API_URL}/auth/login`, payload).pipe(
      tap((res) => {
        localStorage.setItem('token', res.token);
        localStorage.setItem('user', JSON.stringify(res.user));
        this._user$.next(res.user);
      })
    );
  }

  logout(): void {
    // this.http.post(`${this.API_URL}/auth/logout`, {}).subscribe();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this._user$.next(null);
    this.router.navigateByUrl('/login');
  }

  me(): Observable<{ ok: boolean; user: any }> {
    return this.http.get<{ ok: boolean; user: any }>(`${this.API_URL}/auth/userAuth`);
  }

  private getUserFromStorage(): User | null {
    const raw = localStorage.getItem('user');
    try {
      return raw ? (JSON.parse(raw) as User) : null;
    } catch {
      return null;
    }
  }
}
