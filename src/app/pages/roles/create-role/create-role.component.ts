import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RoleService } from '../../../services/role.service';

@Component({
  selector: 'app-create-role',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-role.component.html',
  styleUrls: ['./create-role.component.scss']
})
export class CreateRoleComponent {
  // Objeto para almacenar los datos del nuevo rol
  newRole = {
    name: '',
    code: ''
  };

  constructor(private roleService: RoleService, private router: Router) {}

  // Método para guardar el nuevo rol
  saveNewRole() {
    if (!this.newRole.name || !this.newRole.code) {
      alert('Por favor, completa todos los campos.');
      return;
    }

    this.roleService.createRole(this.newRole).subscribe({
      next: () => {
        alert('Rol creado exitosamente.');
        this.goBack(); // Regresar a la lista de roles
      },
      error: (err) => {
        console.error('Error creando el rol:', err);
        alert('Hubo un error al crear el rol.');
      }
    });
  }

  // Método para regresar a la lista de roles
  goBack() {
    this.router.navigate(['/roles']);
  }
}