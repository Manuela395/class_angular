import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';

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
  filterText = '';
  openDropdownId: string | null = null;

  constructor(
    private userService: UserService,
    private router: Router, private cdr: ChangeDetectorRef
  ) {}

  toggleDropdown(userId: string, event: Event) {
    event.stopPropagation();
    this.openDropdownId = this.openDropdownId === userId ? null : userId;
  }

  closeDropdown() {
    this.openDropdownId = null;
  }

  ngOnInit(): void {
    this.loadUsers();
  }

  // Obtener todos los usuarios
  loadUsers() {
    this.userService.getUsers().subscribe({
      next: (res) => {
        this.users = res.users || [];
        this.filteredUsers = [...this.users];
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error cargando usuarios:', err)
    });
  }

  // Filtrar usuarios por nombre o identificación
  applyFilter() {
    const text = this.filterText.toLowerCase();
    this.filteredUsers = this.users.filter(
      (u) =>
        u.name?.toLowerCase().includes(text) ||
        u.last_name?.toLowerCase().includes(text) ||
        u.identification?.toLowerCase().includes(text)
    );
  }

  // Navegar a la página de crear
  goToCreate() {
    this.router.navigate(['/usuarios/crear']);
  }

  // Navegar a la página de actualizar
  goToUpdate(userId: string) {
    this.router.navigate(['/usuarios/actualizar', userId]);
  }

  // Eliminar usuario
  deleteUser(id: string) {
    if (confirm('¿Estás seguro de eliminar este usuario?')) {
      this.userService.deleteUser(id).subscribe({
        next: () => {
          alert('Usuario eliminado exitosamente.');
          this.loadUsers();
        },
        error: (err) => {
          console.error('Error eliminando usuario:', err);
          alert(err.error?.error || 'Error al eliminar usuario.');
        }
      });
    }
  }
}
