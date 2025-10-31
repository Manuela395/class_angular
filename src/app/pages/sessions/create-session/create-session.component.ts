import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { EcgSessionService } from '../../../services/ecg-session.service';
import { DoctorAppointmentService } from '../../../services/doctor-appointment.service';
import { DeviceService } from '../../../services/device.service';

@Component({
  selector: 'app-create-session',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-session.component.html',
  styleUrls: ['./create-session.component.scss']
})
export class CreateSessionComponent implements OnInit {
  appointments: any[] = [];
  devices: any[] = [];
  form: any = {
    appointment_id: '',
    clinical_register_id: '',
    device_id: '',
    sampling_hz: null,
    lead_config: ''
  };

  constructor(
    private ecgSessionService: EcgSessionService,
    private doctorAppointmentService: DoctorAppointmentService,
    private deviceService: DeviceService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    this.doctorAppointmentService.getAppointments().subscribe({
      next: (res) => this.appointments = res.appointments || [],
      error: (err) => console.error('Error cargando citas:', err)
    });
    this.deviceService.getDevices().subscribe({
      next: (res) => this.devices = res.devices || [],
      error: (err) => console.error('Error cargando dispositivos:', err)
    });
  }

  save() {
    if (!this.form.appointment_id || !this.form.device_id) {
      alert('Selecciona cita y dispositivo.');
      return;
    }
    this.ecgSessionService.createSession(this.form).subscribe({
      next: () => {
        alert('Sesión creada exitosamente.');
        this.router.navigate(['/sesiones']);
      },
      error: (err) => {
        console.error('Error creando sesión:', err);
        alert(err.error?.error || 'Error al crear sesión.');
      },
    });
  }

  cancel() {
    this.router.navigate(['/sesiones']);
  }
}


