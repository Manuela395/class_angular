// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { RolesComponent } from './pages/roles/roles.component';
import { UsersComponent } from './pages/users/users.component';
import { DevicesComponent } from './pages/devices/devices.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'home' },

  {
    path: '',
    loadComponent: () => import('./layouts/auth-layout/auth-layout').then((m) => m.AuthLayout),
    children: [
      {
        path: 'login',
        loadComponent: () => import('./pages/login/login').then((m) => m.Login),
      },
    ],
  },

  {
    path: '',
    loadComponent: () => import('./layouts/app-layout/app-layout').then((m) => m.AppLayout),
    canActivateChild: [authGuard], // protege todas las rutas hijas
    children: [
      {
        path: 'home',
        loadComponent: () => import('./pages/home/home').then((m) => m.Home),
      },
         {
           path: 'roles',
           loadComponent: () =>
             import('./pages/roles/roles.component')
               .then(m => m.RolesComponent)
         },
  
         {
           path: 'usuarios',
           loadComponent: () =>
             import('./pages/users/users.component')
               .then(m => m.UsersComponent)
         },
         {
        path: 'dispositivos',
           loadComponent: () =>
             import('./pages/devices/devices.component')
               .then(m => m.DevicesComponent)
         },
      { path: '', pathMatch: 'full', redirectTo: 'home' },
    ],
  },

  { path: '**', redirectTo: 'home' },
];