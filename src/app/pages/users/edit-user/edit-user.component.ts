import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { UserService } from '../../../services/user.service';
import { RoleService } from '../../../services/role.service';

@Component({
  selector: 'app-edit-user',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './edit-user.component.html',
  styleUrls: ['./edit-user.component.scss']
})
export class EditUserComponent implements OnInit {
  userId: string | null = null;
  roles: any[] = [];
  user = {
    name: '',
    last_name: '',
    identification: '',
    phone: '',
    email: '',
    gender: 'M',
    birthdate: '',
    password: '',
    roles: ['pac']
  };

  constructor(
    private userService: UserService,
    private roleService: RoleService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.userId = params['id'];
      this.loadRoles();
      this.loadUser();
    });
  }

  loadRoles() {
    this.roleService.getRoles().subscribe({
      next: (res) => (this.roles = res.roles || []),
      error: (err: any) => console.error('Error cargando roles:', err)
    });
  }

  loadUser() {
    if (this.userId) {
      this.userService.getUsers().subscribe({
        next: (res) => {
          const user = res.users?.find((u: any) => u.id === this.userId);
          if (user) {
            this.user = {
              name: user.name,
              last_name: user.last_name || '',
              identification: user.identification,
              phone: user.phone || '',
              email: user.email,
              gender: user.gender || 'M',
              birthdate: user.birthdate || '',
              password: '',
              roles: [user.role?.code || 'pac']
            };
          }
        },
        error: (err: any) => console.error('Error cargando usuario:', err)
      });
    }
  }

  updateUser() {
    if (!this.user.name || !this.user.identification || !this.user.email) {
      alert('Por favor, completa los campos obligatorios.');
      return;
    }

    if (this.userId) {
      this.userService.updateUser(this.userId, this.user).subscribe({
        next: () => {
          alert('Usuario actualizado exitosamente.');
          this.router.navigate(['/usuarios']);
        },
        error: (err: any) => {
          console.error('Error actualizando usuario:', err);
          alert('Hubo un error al actualizar el usuario.');
        }
      });
    }
  }

  goBack() {
    this.router.navigate(['/usuarios']);
  }
}

