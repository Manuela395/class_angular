import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-appointment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-appointment.component.html',
  styleUrls: ['./create-appointment.component.scss']
})
export class CreateAppointmentComponent implements OnInit {
  newAppointment = {
    user_id_doctor: '',
    user_id_patient: '',
    date_appointment: '',
    hour_appointment: '',
    status: 'Asignada',
    place: '',
    notes: ''
  };

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Aquí puedes cargar doctores y pacientes disponibles
  }

  saveAppointment() {
    alert('Funcionalidad de crear cita pendiente de implementar.');
    // TODO: Implementar lógica de creación
  }

  goBack() {
    this.router.navigate(['/citas']);
  }
}

