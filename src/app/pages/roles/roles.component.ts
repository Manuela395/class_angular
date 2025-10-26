import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RoleService } from '../../services/role.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './roles.component.html',
  styleUrls: ['./roles.component.scss']
})
export class RolesComponent implements OnInit {
  roles: any[] = [];
  filteredRoles: any[] = [];
  filterText = '';

  // Variables para el modal
  showModal = false;
  editMode = false;
  selectedRole: any = { name: '', code: '' };

  constructor(private roleService: RoleService) {}

  ngOnInit(): void {
    this.loadRoles();
  }

  // Cargar todos los roles desde el backend
  loadRoles() {
    this.roleService.getRoles().subscribe({
      next: (res) => {
        // Si la respuesta ya es un arreglo, úsalo. Si no, busca la propiedad 'roles'.
        const rolesData = Array.isArray(res) ? res : res.roles;
        this.roles = rolesData || [];
        this.filteredRoles = [...this.roles];
      },
      error: (err) => console.error('Error cargando roles:', err)
    });
  }

  // Filtrar roles por texto
  applyFilter() {
    const text = this.filterText.toLowerCase();
    this.filteredRoles = this.roles.filter(
      (r) =>
        r.name.toLowerCase().includes(text) ||
        r.code.toLowerCase().includes(text)
    );
  }

  // Abrir modal de creación o edición
  openModal(role?: any) {
    if (role) {
      this.selectedRole = { ...role };
      this.editMode = true;
    } else {
      this.selectedRole = { name: '', code: '' };
      this.editMode = false;
    }
    this.showModal = true;
  }

  // Cerrar modal
  closeModal() {
    this.showModal = false;
  }

  // Guardar cambios (crear o actualizar)
  saveRole() {
    if (this.editMode) {
      this.roleService
        .updateRole(this.selectedRole.id, this.selectedRole)
        .subscribe({
          next: () => {
            this.loadRoles();
            this.closeModal();
          },
          error: (err) => console.error('Error actualizando rol:', err)
        });
    } else {
      this.roleService.createRole(this.selectedRole).subscribe({
        next: () => {
          this.loadRoles();
          this.closeModal();
        },
        error: (err) => console.error('Error creando rol:', err)
      });
    }
  }

  // Eliminar rol
  deleteRole(id: number) {
    if (confirm('¿Estás seguro de eliminar este rol?')) {
      this.roleService.deleteRole(id).subscribe({
        next: () => this.loadRoles(),
        error: (err) => console.error('Error eliminando rol:', err)
      });
    }
  }
}
