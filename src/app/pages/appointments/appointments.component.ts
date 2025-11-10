import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AppointmentService } from '../../services/appointment.service';

@Component({
  selector: 'app-appointments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './appointments.component.html',
  styleUrls: ['./appointments.component.scss']
})
export class AppointmentsComponent implements OnInit {
  appointments: any[] = [];
  filteredAppointments: any[] = [];
  filterText = '';
  openDropdownId: number | null = null;

  constructor(
    private appointmentService: AppointmentService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadAppointments();
  }

  toggleDropdown(appointmentId: number, event: Event) {
    event.stopPropagation();
    this.openDropdownId = this.openDropdownId === appointmentId ? null : appointmentId;
  }

  closeDropdown() {
    this.openDropdownId = null;
  }

  // Cargar todas las citas
  loadAppointments() {
    this.appointmentService.getAppointments().subscribe({
      next: (res) => {
        ////console.log('Appointments loaded:', res);
        this.appointments = res.appointments || [];
        this.filteredAppointments = [...this.appointments];
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error cargando citas:', err);
        alert(err.error?.error || 'Error al cargar las citas.');
      }
    });
  }

  // Filtrar citas por paciente o doctor
  applyFilter() {
    const text = this.filterText.toLowerCase();
    this.filteredAppointments = this.appointments.filter(
      (apt) =>
        apt.patient?.name?.toLowerCase().includes(text) ||
        apt.patient?.email?.toLowerCase().includes(text) ||
        apt.doctor?.name?.toLowerCase().includes(text) ||
        apt.doctor?.email?.toLowerCase().includes(text)
    );
  }

  // Navegar a la página de crear
  goToCreate() {
    this.router.navigate(['/citas/crear']);
  }

  // Navegar a la página de actualizar
  goToUpdate(appointmentId: number) {
    this.router.navigate(['/citas/actualizar', appointmentId]);
  }

  // Eliminar cita
  deleteAppointment(id: number) {
    if (confirm('¿Estás seguro de eliminar esta cita?')) {
      this.appointmentService.deleteAppointment(id.toString()).subscribe({
        next: () => {
          alert('Cita eliminada exitosamente.');
          this.loadAppointments();
        },
        error: (err) => {
          console.error('Error eliminando cita:', err);
          alert(err.error?.error || 'Error al eliminar cita.');
        }
      });
    }
  }

  // Formatear fecha para mostrar
  formatDate(date: string): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  }

  // Formatear hora
  formatHour(hour: string): string {
    if (!hour) return '';
    return hour;
  }
}
