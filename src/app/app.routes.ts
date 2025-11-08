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

      {
        path: 'citas',
        loadComponent: () =>
          import('./pages/appointments/appointments.component')
            .then(m => m.AppointmentsComponent)
      },
      {
        path: 'citas/crear',
        loadComponent: () =>
          import('./pages/appointments/create-appointment/create-appointment.component')
            .then(m => m.CreateAppointmentComponent)
      },
      {
        path: 'citas/actualizar/:id',
        loadComponent: () =>
          import('./pages/appointments/edit-appointment/edit-appointment.component')
            .then(m => m.EditAppointmentComponent)
      },

      {
        path: 'triages',
        loadComponent: () =>
          import('./pages/clinical/clinical.component')
            .then(m => m.ClinicalComponent)
      },
      {
        path: 'triages/crear',
        loadComponent: () =>
          import('./pages/clinical/create-triage/create-triage.component')
            .then(m => m.CreateTriageComponent)
      },
      {
        path: 'triages/actualizar/:id',
        loadComponent: () =>
          import('./pages/clinical/edit-triage/edit-triage.component')
            .then(m => m.EditTriageComponent)
      },
      {
        path: 'sesiones',
        loadComponent: () =>
          import('./pages/sessions/sessions.component')
            .then(m => m.SessionsComponent)
      },
      {
        path: 'sesiones/crear',
        loadComponent: () =>
          import('./pages/sessions/create-session/create-session.component')
            .then(m => m.CreateSessionComponent)
      },
      {
        path: 'sesiones/editar/:id',
        loadComponent: () =>
          import('./pages/sessions/edit-session/edit-session.component')
            .then(m => m.EditSessionComponent)
      },
      {
        path: 'lecturas',
        loadComponent: () =>
          import('./pages/readings/readings.component')
            .then(m => m.ReadingsComponent)
      },
      {
        path: 'lecturas/crear',
        loadComponent: () =>
          import('./pages/readings/create-reading/create-reading.component')
            .then(m => m.CreateReadingComponent)
      },
     
     
      { path: '', pathMatch: 'full', redirectTo: 'home' },
    ],
  },

  { path: '**', redirectTo: 'home' },
];