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
        path: 'roles/crear',
        loadComponent: () =>
          import('./pages/roles/create-role/create-role.component')
            .then(m => m.CreateRoleComponent)
      },
      {
        path: 'roles/actualizar/:id',
        loadComponent: () =>
          import('./pages/roles/edit-role/edit-role.component')
            .then(m => m.EditRoleComponent)
      },

      {
        path: 'usuarios',
        loadComponent: () =>
          import('./pages/users/users.component')
            .then(m => m.UsersComponent)
      },
      {
        path: 'usuarios/crear',
        loadComponent: () =>
          import('./pages/users/create-user/create-user.component')
            .then(m => m.CreateUserComponent)
      },
      {
        path: 'usuarios/actualizar/:id',
        loadComponent: () =>
          import('./pages/users/edit-user/edit-user.component')
            .then(m => m.EditUserComponent)
      },
      
      {
        path: 'dispositivos',
        loadComponent: () =>
          import('./pages/devices/devices.component')
            .then(m => m.DevicesComponent)
      },
      {
        path: 'dispositivos/crear',
        loadComponent: () =>
          import('./pages/devices/create-device/create-device.component')
            .then(m => m.CreateDeviceComponent)
      },
      {
        path: 'dispositivos/actualizar/:id',
        loadComponent: () =>
          import('./pages/devices/edit-device/edit-device.component')
            .then(m => m.EditDeviceComponent)
      },
      { path: '', pathMatch: 'full', redirectTo: 'home' },
    ],
  },

  { path: '**', redirectTo: 'home' },
];