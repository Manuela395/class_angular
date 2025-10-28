import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../../services/user.service';
import { RoleService } from '../../../services/role.service';

@Component({
  selector: 'app-create-user',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-user.component.html',
  styleUrls: ['./create-user.component.scss']
})
export class CreateUserComponent implements OnInit {
  roles: any[] = [];
  newUser = {
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
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadRoles();
  }

  loadRoles() {
    this.roleService.getRoles().subscribe({
      next: (res) => (this.roles = res.roles || []),
      error: (err) => console.error('Error cargando roles:', err)
    });
  }

  saveUser() {
    if (!this.newUser.name || !this.newUser.identification || !this.newUser.email) {
      alert('Por favor, completa los campos obligatorios.');
      return;
    }

    this.userService.createUser(this.newUser).subscribe({
      next: (response) => {
        console.log('Usuario creado:', response);
        alert('Usuario creado exitosamente.');
        this.router.navigate(['/usuarios']);
      },
      error: (err) => {
        console.error('Error creando usuario:', err);
        
        // Mostrar el error específico del servidor si existe
        let errorMessage = 'Hubo un error al crear el usuario.';
        if (err.error?.error) {
          errorMessage = `Error: ${err.error.error}`;
        } else if (err.error?.details) {
          errorMessage = `Error: ${err.error.details}`;
        }
        
        alert(errorMessage);
      }
    });
  }

  goBack() {
    this.router.navigate(['/usuarios']);
  }
}
