import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { EcgSessionService } from '../../../services/ecg-session.service';
import { DoctorAppointmentService } from '../../../services/doctor-appointment.service';
import { DeviceService } from '../../../services/device.service';

@Component({
  selector: 'app-edit-session',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './edit-session.component.html',
  styleUrls: ['./edit-session.component.scss']
})
export class EditSessionComponent implements OnInit {
  sessionId: string | null = null;
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
    private route: ActivatedRoute,
    private router: Router,
    private ecgSessionService: EcgSessionService,
    private doctorAppointmentService: DoctorAppointmentService,
    private deviceService: DeviceService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.sessionId = params['id'];
      this.loadSession();
    });
    this.loadLists();
  }

  loadLists() {
    this.doctorAppointmentService.getAppointments().subscribe({
      next: (res) => this.appointments = res.appointments || [],
      error: (err) => console.error('Error cargando citas:', err)
    });
    this.deviceService.getDevices().subscribe({
      next: (res) => this.devices = res.devices || [],
      error: (err) => console.error('Error cargando dispositivos:', err)
    });
  }

  loadSession() {
    if (!this.sessionId) return;
    this.ecgSessionService.getSessionById(this.sessionId).subscribe({
      next: (res) => {
        const s = res.ecg_session;
        if (!s) return;
        this.form = {
          appointment_id: s.appointment_id || s.appointment?.id || '',
          clinical_register_id: s.clinical_register_id || s.clinicalRegister?.id || '',
          device_id: s.device_id || s.device?.id || '',
          sampling_hz: s.sampling_hz ?? null,
          lead_config: s.lead_config || ''
        };
      },
      error: (err) => console.error('Error cargando sesión:', err)
    });
  }

  update() {
    if (!this.sessionId) return;
    this.ecgSessionService.updateSession(this.sessionId, this.form).subscribe({
      next: () => {
        alert('Sesión actualizada exitosamente.');
        this.router.navigate(['/sesiones']);
      },
      error: (err) => {
        console.error('Error actualizando sesión:', err);
        alert(err.error?.error || 'Error al actualizar sesión.');
      }
    });
  }

  cancel() {
    this.router.navigate(['/sesiones']);
  }
}


