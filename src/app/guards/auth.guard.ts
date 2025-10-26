import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { inject } from '@angular/core';
import { catchError, map, of, tap } from 'rxjs';

export const authGuard: CanActivateFn = (_route, _state) => {
  const auth = inject(AuthService);

  const router = new Router();
  const token = localStorage.getItem('token');
  if (!token) {
    router.navigateByUrl('/login');
    return false;
  }
  // hay token: validemos en el backend
  return auth.me().pipe(
    tap((res) => auth['_user$'].next(res.user)), // o crea un setUser(res.user)
    map(() => true),
    catchError(() => {
      auth.logout(); // limpia y redirige
      return of(false);
    })
  );
};
