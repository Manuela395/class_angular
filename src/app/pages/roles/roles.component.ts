import { Component, OnInit, ChangeDetectorRef  } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RoleService } from '../../services/role.service';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';


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

  constructor(private roleService: RoleService, private router: Router, private cdr: ChangeDetectorRef) {}

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
        this.cdr.detectChanges(); 
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

  // Navegar a la página de crear
  goToCreate() {
    this.router.navigate(['/roles/crear']);
  }

  // Navegar a la página de actualizar
  goToUpdate(roleId: number) {
    this.router.navigate(['/roles/actualizar', roleId]);
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
