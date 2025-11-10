import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss'
})
export class Sidebar implements OnInit {
  user = JSON.parse(localStorage.getItem('user') || '{}');
  
  // Obtener el rol principal del usuario
  // Puede venir como this.user.role.code o this.user.role directamente
  get userRole(): string {
    // Primero intenta obtener el código del rol
    if (this.user.role?.code) {
      return this.user.role.code;
    }
    // Si no, intenta obtener el rol directo como string
    if (typeof this.user.role === 'string') {
      return this.user.role;
    }
    // Por defecto retorna 'pac'
    return 'pac';
  }
  
  // Debug: Log para ver la estructura del usuario
  ngOnInit(): void {
    //console.log('Sidebar - User object:', this.user);
    //console.log('Sidebar - User role:', this.userRole);
    //console.log('Sidebar - isAdmin()', this.isAdmin());
    //console.log('Sidebar - isAdminAux()', this.isAdminAux());
    //console.log('Sidebar - isDoctor()', this.isDoctor());
  }
  
  // Verificar si el usuario tiene un rol específico
  hasRole(roleCode: string): boolean {
    return this.userRole === roleCode;
  }
  
  // Verificar si es admin
  isAdmin(): boolean {
    return this.hasRole('admin');
  }
  
  // Verificar si es admin auxiliar
  isAdminAux(): boolean {
    return this.hasRole('admin_aux');
  }
  
  // Verificar si es doctor
  isDoctor(): boolean {
    return this.hasRole('doc');
  }
}
