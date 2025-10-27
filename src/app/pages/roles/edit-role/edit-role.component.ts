import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { RoleService } from '../../../services/role.service';

@Component({
  selector: 'app-edit-role',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './edit-role.component.html',
  styleUrls: ['./edit-role.component.scss']
})
export class EditRoleComponent implements OnInit {
  roleId: number | null = null;
  role = {
    name: '',
    code: ''
  };

  constructor(
    private roleService: RoleService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.roleId = +params['id'];
      this.loadRole();
    });
  }

  loadRole() {
    if (this.roleId) {
      this.roleService.getRoles().subscribe({
        next: (res) => {
          const rolesData = Array.isArray(res) ? res : res.roles;
          const role = rolesData?.find((r: any) => r.id === this.roleId);
          if (role) {
            this.role = { name: role.name, code: role.code };
          }
        },
        error: (err: any) => console.error('Error cargando rol:', err)
      });
    }
  }

  updateRole() {
    if (!this.role.name || !this.role.code) {
      alert('Por favor, completa todos los campos.');
      return;
    }

    if (this.roleId) {
      this.roleService.updateRole(this.roleId, this.role).subscribe({
        next: () => {
          alert('Rol actualizado exitosamente.');
          this.router.navigate(['/roles']);
        },
        error: (err: any) => {
          console.error('Error actualizando rol:', err);
          alert('Hubo un error al actualizar el rol.');
        }
      });
    }
  }

  goBack() {
    this.router.navigate(['/roles']);
  }
}
