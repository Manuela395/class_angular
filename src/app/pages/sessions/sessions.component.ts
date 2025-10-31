import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { EcgSessionService } from '../../services/ecg-session.service';

@Component({
  selector: 'app-sessions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sessions.component.html',
  styleUrls: ['./sessions.component.scss']
})
export class SessionsComponent implements OnInit {
  sessions: any[] = [];
  filteredSessions: any[] = [];
  filterText = '';
  openDropdownId: number | null = null;
  loading = false;

  constructor(
    private router: Router,
    private cdr: ChangeDetectorRef,
    private ecgSessionService: EcgSessionService
  ) {}

  ngOnInit(): void {
    this.loadSessions();
  }

  loadSessions() {
    this.loading = true;
    this.ecgSessionService.getSessions().subscribe({
      next: (res) => {
        // Según backend: { ok: true, ecg_sessions: [...] }
        this.sessions = res.ecg_sessions || [];
        this.filteredSessions = [...this.sessions];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error cargando sesiones:', err);
        this.loading = false;
        alert(err.error?.error || 'Error al cargar sesiones ECG.');
      }
    });
  }

  applyFilter() {
    const text = this.filterText.toLowerCase();
    this.filteredSessions = this.sessions.filter((s: any) => {
      // Buscar por paciente o identificación
      const patient = s.appointment?.patient;
      return (
        (patient?.name || '').toLowerCase().includes(text) ||
        (patient?.identification || '').toLowerCase().includes(text)
      );
    });
  }

  goBack() {
    this.router.navigate(['/home']);
  }

  goToUpdate(sessionId: number) {
    this.router.navigate(['/sesiones/editar', sessionId]);
  }

  deleteSession(sessionId: number) {
    if (confirm('¿Estás seguro de eliminar esta sesión?')) {
      this.ecgSessionService.deleteSession(sessionId.toString()).subscribe({
        next: () => {
          alert('Sesión eliminada exitosamente.');
          this.loadSessions();
        },
        error: (err) => {
          console.error('Error eliminando sesión:', err);
          alert(err.error?.error || 'Error al eliminar sesión.');
        }
      });
    }
  }

  toggleDropdown(sessionId: number, event: Event) {
    event.stopPropagation();
    this.openDropdownId = this.openDropdownId === sessionId ? null : sessionId;
  }

  closeDropdown() {
    this.openDropdownId = null;
  }

  openCreate() {
    this.router.navigate(['/sesiones/crear']);
  }
}


