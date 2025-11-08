import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { EcgSessionService } from '../../../services/ecg-session.service';

@Component({
  selector: 'app-edit-session',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './edit-session.component.html',
  styleUrls: ['./edit-session.component.scss']
})
export class EditSessionComponent implements OnInit {
  sessionId: string | null = null;
  patientName: string = '';
  patientIdentification: string = '';
  assignedDeviceName: string = 'No asignado';
  form: any = {
    sampling_hz: null,
    lead_config: ''
  };
  // Campos readonly que se mantienen pero no se envían en el update
  private appointmentId: number | null = null;
  private clinicalRegisterId: number | null = null;
  private deviceId: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private ecgSessionService: EcgSessionService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.sessionId = params['id'];
      this.loadSession();
    });
  }

  loadSession() {
    if (!this.sessionId) return;
    this.ecgSessionService.getSessionById(this.sessionId).subscribe({
      next: (res) => {
        const s = res.ecg_session;
        if (!s) return;
        
        // Guardar IDs para referencia (no se modifican)
        this.appointmentId = s.appointment_id || s.appointment?.id || null;
        this.clinicalRegisterId = s.clinical_register_id || s.clinicalRegister?.id || null;
        this.deviceId = s.device_id || s.device?.id || null;
        
        // Cargar información del paciente para mostrar
        const patient = s.appointment?.patient || s.patient;
        if (patient) {
          this.patientName = `${patient.name || ''} ${patient.last_name || ''}`.trim();
          this.patientIdentification = patient.identification || '';
        } else {
          this.patientName = '';
          this.patientIdentification = '';
        }
        
        // Cargar información del dispositivo para mostrar
        const device = s.device;
        if (device) {
          this.assignedDeviceName = device.name || `Device ${device.device_id || device.id}` || 'No asignado';
        } else {
          this.assignedDeviceName = 'No asignado';
        }
        
        // Solo cargar los campos editables
        this.form = {
          sampling_hz: s.sampling_hz ?? null,
          lead_config: s.lead_config || ''
        };
      },
      error: (err) => {
        console.error('Error cargando sesión:', err);
        alert('Error cargando la sesión: ' + (err.error?.error || err.message));
      }
    });
  }

  update() {
    if (!this.sessionId) return;
    
    // Solo enviar los campos editables (sampling_hz y lead_config)
    const updateData = {
      sampling_hz: this.form.sampling_hz || null,
      lead_config: this.form.lead_config || null
    };
    
    this.ecgSessionService.updateSession(this.sessionId, updateData).subscribe({
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


