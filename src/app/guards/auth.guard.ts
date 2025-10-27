import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { inject } from '@angular/core';
import { catchError, map, of, tap } from 'rxjs';

export const authGuard: CanActivateFn = (_route, _state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  
  const token = localStorage.getItem('token');
  if (!token) {
    router.navigateByUrl('/login');
    return false;
  }
  // hay token: validemos en el backend
  return auth.me().pipe(
    tap((res: { ok: boolean; user: any }) => {
      const user = res.user;
      // Update the user in the auth service
      localStorage.setItem('user', JSON.stringify(user));
      auth['_user$'].next(user);
    }),
    map(() => true),
    catchError(() => {
      auth.logout(); // limpia y redirige
      return of(false);
    })
  );
};
