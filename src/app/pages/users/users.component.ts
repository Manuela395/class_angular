import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { RoleService } from '../../services/role.service';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {
  users: any[] = [];
  filteredUsers: any[] = [];
  roles: any[] = [];
  filterText = '';

  // Modal
  showModal = false;
  editMode = false;
  selectedUser: any = {
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

  constructor(private userService: UserService, private roleService: RoleService) {}

  ngOnInit(): void {
    this.loadUsers();
    this.loadRoles();
  }

  // Obtener todos los usuarios
  loadUsers() {
    this.userService.getUsers().subscribe({
      next: (res) => {
        this.users = res.users || [];
        this.filteredUsers = [...this.users];
      },
      error: (err) => console.error('Error cargando usuarios:', err)
    });
  }

  // Obtener los roles disponibles (para el select del modal)
  loadRoles() {
    this.roleService.getRoles().subscribe({
      next: (res) => (this.roles = res.roles || []),
      error: (err) => console.error('Error cargando roles:', err)
    });
  }

  // Filtrar usuarios por nombre o identificación
  applyFilter() {
    const text = this.filterText.toLowerCase();
    this.filteredUsers = this.users.filter(
      (u) =>
        u.name.toLowerCase().includes(text) ||
        u.last_name.toLowerCase().includes(text) ||
        u.identification.toLowerCase().includes(text)
    );
  }

  // Abrir modal para crear o editar usuario
  openModal(user?: any) {
    if (user) {
      this.selectedUser = { ...user, roles: [user.role?.code || 'pac'] };
      this.editMode = true;
    } else {
      this.selectedUser = {
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
      this.editMode = false;
    }
    this.showModal = true;
  }

  // Cerrar modal
  closeModal() {
    this.showModal = false;
  }

  // Crear o actualizar usuario
  saveUser() {
    if (this.editMode) {
      this.userService.updateUser(this.selectedUser.id, this.selectedUser).subscribe({
        next: () => {
          this.loadUsers();
          this.closeModal();
        },
        error: (err) => console.error('Error actualizando usuario:', err)
      });
    } else {
      this.userService.createUser(this.selectedUser).subscribe({
        next: () => {
          this.loadUsers();
          this.closeModal();
        },
        error: (err) => console.error('Error creando usuario:', err)
      });
    }
  }

  // Eliminar usuario
  deleteUser(id: string) {
    if (confirm('¿Estás seguro de eliminar este usuario?')) {
      this.userService.deleteUser(id).subscribe({
        next: () => this.loadUsers(),
        error: (err) => console.error('Error eliminando usuario:', err)
      });
    }
  }
}
