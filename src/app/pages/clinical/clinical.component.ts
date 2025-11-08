import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TriageService } from '../../services/triage.service';
import { DoctorAppointmentService } from '../../services/doctor-appointment.service';

@Component({
  selector: 'app-clinical',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './clinical.component.html',
  styleUrls: ['./clinical.component.scss']
})
export class ClinicalComponent implements OnInit {
  triages: Array<{
    id: number;
    appointment: any;
    hasTriage: boolean;
    triageId: number | null;
    clinical?: any;
  }> = [];
  filteredTriages: any[] = [];
  filterText = '';
  openDropdownId: number | null = null;
  selectedTriage: number | null = null;
  private readonly storageKeyTriageId = 'selected_triage_id';
  private readonly storageKeyAppointmentId = 'selected_triage_appointment_id';

  constructor(
    private triageService: TriageService,
    private doctorAppointmentService: DoctorAppointmentService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Restaurar selección persistida antes de renderizar
    const savedId = localStorage.getItem(this.storageKeyTriageId);
    this.selectedTriage = savedId ? Number(savedId) : null;
    this.loadTriages();
  }

  toggleDropdown(triageId: number, event: Event) {
    event.stopPropagation();
    this.openDropdownId = this.openDropdownId === triageId ? null : triageId;
  }

  closeDropdown() {
    this.openDropdownId = null;
  }

  loadTriages() {
    this.doctorAppointmentService.getAppointments().subscribe({
      next: (aptRes) => {
        const appointments = aptRes.appointments || [];
        this.triageService.getTriages().subscribe({
          next: (triRes) => {
            const clinicals = triRes.clinicals || [];
            const appointmentTriagesMap = new Map<number, any>();

            clinicals.forEach((clinical: any) => {
              const appointmentId = clinical.appointment_id || clinical.appointment?.id;
              if (appointmentId) {
                appointmentTriagesMap.set(Number(appointmentId), clinical);
              }
            });

            this.triages = appointments.map((apt: any) => {
              const clinical = appointmentTriagesMap.get(Number(apt.id));
              return {
                id: apt.id,
                appointment: apt,
                hasTriage: !!clinical,
                triageId: clinical?.id ?? null,
                clinical
              };
            });
            this.filteredTriages = [...this.triages];
            this.cdr.detectChanges();
          },
          error: (err) => {
            console.error('Error cargando triages:', err);
            this.triages = (appointments || []).map((apt: any) => ({ id: apt.id, appointment: apt, hasTriage: false }));
            this.filteredTriages = [...this.triages];
            this.cdr.detectChanges();
          }
        });
      },
      error: (err) => {
        console.error('Error cargando citas:', err);
        alert(err.error?.error || 'Error al cargar las citas.');
      }
    });
  }

  applyFilter() {
    const text = this.filterText.toLowerCase();
    this.filteredTriages = this.triages.filter((t: any) =>
      t.appointment?.patient?.name?.toLowerCase().includes(text) ||
      t.appointment?.patient?.identification?.toLowerCase().includes(text)
    );
  }

  goToCreate() {
    const savedAppointmentId = localStorage.getItem(this.storageKeyAppointmentId);
    if (!savedAppointmentId) {
      alert('Seleccione una cita sin triage para habilitar la creación.');
      return;
    }
    const row = this.triages.find((r) => String(r.id) === String(savedAppointmentId));
    if (row?.hasTriage) {
      alert('La cita seleccionada ya tiene triage. Seleccione otra.');
      return;
    }
    this.router.navigate(['/triages/crear']);
  }

  goToUpdate(triageId: number) {
    this.router.navigate(['/triages/actualizar', triageId]);
  }

  deleteTriage(id: number) {
    if (confirm('¿Estás seguro de eliminar este triage?')) {
      this.triageService.deleteTriage(id.toString()).subscribe({
        next: () => {
          alert('Triage eliminado exitosamente.');
          this.loadTriages();
        },
        error: (err) => {
          console.error('Error eliminando triage:', err);
          alert(err.error?.error || 'Error al eliminar triage.');
        }
      });
    }
  }

  onSelectTriage(appointmentId: number) {
    this.selectedTriage = appointmentId;
    localStorage.setItem(this.storageKeyTriageId, String(appointmentId));
    localStorage.setItem(this.storageKeyAppointmentId, String(appointmentId));
  }

  formatDate(date: string): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  }

  formatHour(hour: string): string {
    if (!hour) return '';
    return hour;
  }

  viewDetail(triageId: number | null) {
    if (!triageId) {
      alert('No fue posible encontrar el triage para este paciente.');
      return;
    }
    this.router.navigate(['/triages/actualizar', triageId], {
      queryParams: { mode: 'detalle' }
    });
  }
}
