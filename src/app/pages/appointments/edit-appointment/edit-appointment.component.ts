import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AppointmentService } from '../../../services/appointment.service';
import { DoctorService } from '../../../services/doctor.service';
import { PatientService } from '../../../services/patient.service';

@Component({
  selector: 'app-edit-appointment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './edit-appointment.component.html',
  styleUrls: ['./edit-appointment.component.scss']
})
export class EditAppointmentComponent implements OnInit {
  appointmentId: string | null = null;
  doctors: any[] = [];
  patients: any[] = [];
  appointment = {
    user_id_doctor: '',
    user_id_patient: '',
    date_appointment: '',
    hour_appointment: '',
    status: 'Asignada',
    place: '',
    notes: ''
  };

  constructor(
    private appointmentService: AppointmentService,
    private doctorService: DoctorService,
    private patientService: PatientService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.appointmentId = params['id'];
      this.loadDoctorsAndPatients();
      this.loadAppointment();
    });
  }

  loadDoctorsAndPatients() {
    // Cargar doctores
    this.doctorService.getDoctors().subscribe({
      next: (res) => {
        this.doctors = res.doctors || [];
      },
      error: (err) => {
        console.error('Error cargando doctores:', err);
        alert('Error cargando doctores: ' + (err.error?.error || err.message));
      }
    });

    // Cargar pacientes
    this.patientService.getPatients().subscribe({
      next: (res) => {
        this.patients = res.patients || [];
      },
      error: (err) => {
        console.error('Error cargando pacientes:', err);
        alert('Error cargando pacientes: ' + (err.error?.error || err.message));
      }
    });
  }

  loadAppointment() {
    if (this.appointmentId) {
      this.appointmentService.getAppointmentById(this.appointmentId).subscribe({
        next: (res) => {
          const apt = res.appointment;
          if (apt) {
            this.appointment = {
              user_id_doctor: apt.user_id_doctor,
              user_id_patient: apt.user_id_patient,
              date_appointment: this.formatDateForInput(apt.date_appointment),
              hour_appointment: apt.hour_appointment || '',
              status: apt.status || 'Asignada',
              place: apt.place || '',
              notes: apt.notes || ''
            };
            this.cdr.detectChanges();
          }
        },
        error: (err) => console.error('Error cargando cita:', err)
      });
    }
  }

  formatDateForInput(date: string): string {
    if (!date) return '';
    return date.split('T')[0];
  }

  updateAppointment() {
    if (!this.appointment.user_id_doctor || !this.appointment.user_id_patient || 
        !this.appointment.date_appointment || !this.appointment.hour_appointment) {
      alert('Por favor, completa los campos obligatorios.');
      return;
    }

    if (this.appointmentId) {
      this.appointmentService.updateAppointment(this.appointmentId, this.appointment).subscribe({
        next: () => {
          alert('Cita actualizada exitosamente.');
          this.router.navigate(['/citas']);
        },
        error: (err) => {
          console.error('Error actualizando cita:', err);
          alert(err.error?.error || 'Hubo un error al actualizar la cita.');
        }
      });
    }
  }

  goBack() {
    this.router.navigate(['/citas']);
  }
}
