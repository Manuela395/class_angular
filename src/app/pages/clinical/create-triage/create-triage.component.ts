import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TriageService } from '../../../services/triage.service';
import { DoctorAppointmentService } from '../../../services/doctor-appointment.service';

@Component({
  selector: 'app-create-triage',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-triage.component.html',
  styleUrls: ['./create-triage.component.scss']
})
export class CreateTriageComponent implements OnInit {
  appointments: any[] = [];
  newTriage = {
    appointment_id: '',
    smoker: false,
    drinker: false,
    congenital_diseases: '',
    allergies: '',
    height_cm: null,
    weight_kg: null,
    practice_sport: false,
    consult_type: '',
    summary: ''
  };

  constructor(
    private triageService: TriageService,
    private doctorAppointmentService: DoctorAppointmentService,
    private router: Router
  ) {}

  ngOnInit(): void {
    console.log('CreateTriageComponent initialized');
    console.log('Token:', localStorage.getItem('token'));
    console.log('User:', localStorage.getItem('user'));
    this.loadAppointments();
  }

  loadAppointments() {
    console.log('Loading appointments...');
    this.doctorAppointmentService.getAppointments().subscribe({
      next: (res) => {
        console.log('Appointments loaded successfully:', res);
        this.appointments = res.appointments || [];
        console.log('Appointments array:', this.appointments);
      },
      error: (err) => {
        console.error('Error cargando citas:', err);
        console.error('Error details:', err.error);
        console.error('Error status:', err.status);
        alert('Error cargando citas: ' + (err.error?.error || err.message));
      }
    });
  }

  saveTriage() {
    if (!this.newTriage.appointment_id) {
      alert('Por favor, selecciona una cita.');
      return;
    }

    this.triageService.createTriage(this.newTriage).subscribe({
      next: (response) => {
        console.log('Triage creado:', response);
        alert('Triage creado exitosamente.');
        this.router.navigate(['/triages']);
      },
      error: (err) => {
        console.error('Error creando triage:', err);
        let errorMessage = 'Hubo un error al crear el triage.';
        if (err.error?.error) {
          errorMessage = `Error: ${err.error.error}`;
        }
        alert(errorMessage);
      }
    });
  }

  goBack() {
    this.router.navigate(['/triages']);
  }
}

