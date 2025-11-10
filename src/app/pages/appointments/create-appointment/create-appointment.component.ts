import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AppointmentService } from '../../../services/appointment.service';
import { DoctorService } from '../../../services/doctor.service';
import { PatientService } from '../../../services/patient.service';

@Component({
  selector: 'app-create-appointment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-appointment.component.html',
  styleUrls: ['./create-appointment.component.scss']
})
export class CreateAppointmentComponent implements OnInit {
  doctors: any[] = [];
  patients: any[] = [];
  newAppointment = {
    user_id_doctor: '',
    user_id_patient: '',
    date_appointment: '',
    hour_appointment: '',
    status: 'Asignada',
    place: '',
    notes: ''

  };
  
  minDate: string = '';

  constructor(
    private appointmentService: AppointmentService,
    private doctorService: DoctorService,
    private patientService: PatientService,
    private router: Router
  ) {}

  ngOnInit(): void {
  const today = new Date();
  this.minDate = today.toISOString().split('T')[0];
    this.loadDoctorsAndPatients();
}

  loadDoctorsAndPatients() {
    // Cargar doctores
    this.doctorService.getDoctors().subscribe({
      next: (res) => {
        this.doctors = res.doctors || [];
        ////console.log('Doctors loaded:', this.doctors);
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
        ////console.log('Patients loaded:', this.patients);
      },
      error: (err) => {
        console.error('Error cargando pacientes:', err);
        alert('Error cargando pacientes: ' + (err.error?.error || err.message));
      }
    });
  }

  saveAppointment() {
    if (!this.newAppointment.user_id_doctor || !this.newAppointment.user_id_patient || 
        !this.newAppointment.date_appointment || !this.newAppointment.hour_appointment) {
      alert('Por favor, completa los campos obligatorios.');
      return;
    }

    this.appointmentService.createAppointment(this.newAppointment).subscribe({
      next: (response) => {
        ////console.log('Cita creada:', response);
        alert('Cita creada exitosamente.');
        this.router.navigate(['/citas']);
      },
      error: (err) => {
        console.error('Error creando cita:', err);
        
        let errorMessage = 'Hubo un error al crear la cita.';
        
        // Manejar error específico de cita activa
        if (err.status === 400 && err.error?.error) {
          errorMessage = err.error.error;
        } else if (err.error?.error) {
          errorMessage = `Error: ${err.error.error}`;
        } else if (err.error?.details) {
          errorMessage = `Error: ${err.error.details}`;
        }
        
        alert(errorMessage);
      }
    });
  }

  goBack() {
    this.router.navigate(['/citas']);
  }
}