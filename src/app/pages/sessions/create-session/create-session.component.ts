import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { EcgSessionService } from '../../../services/ecg-session.service';

@Component({
  selector: 'app-create-session',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-session.component.html',
  styleUrls: ['./create-session.component.scss']
})
export class CreateSessionComponent implements OnInit {
  eligiblePatients: any[] = [];
  selectedPatientId: string = '';
  selectedPatientName: string = '';
  selectedPatientIdentification: string = '';
  selectedAssignedDevice: string = '';
  selectedAppointmentId: string = '';
  selectedClinicalRegisterId: string = '';
  selectedAssignedDeviceId: number | null = null;
  form: any = {
    appointment_id: '',
    clinical_register_id: '',
    device_id: '',
    sampling_hz: null,
    lead_config: ''
  };

  constructor(
    private ecgSessionService: EcgSessionService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    // Cargar pacientes elegibles (con cita y triage, sin sesión)
    this.ecgSessionService.getEligiblePatients().subscribe({
      next: (res) => {
        this.eligiblePatients = res.patients || [];
      },
      error: (err) => {
        console.error('Error cargando pacientes elegibles:', err);
        alert('Error cargando pacientes elegibles: ' + (err.error?.error || err.message));
      }
    });
  }

  onPatientChange() {
    if (!this.selectedPatientId) {
      this.selectedPatientName = '';
      this.selectedPatientIdentification = '';
      this.selectedAssignedDevice = '';
      this.selectedAssignedDeviceId = null;
      this.selectedAppointmentId = '';
      this.selectedClinicalRegisterId = '';
      this.form.appointment_id = '';
      this.form.clinical_register_id = '';
      this.form.device_id = null;
      return;
    }

    const patient = this.eligiblePatients.find(p => p.patient_id === this.selectedPatientId);
    if (patient) {
      this.selectedPatientName = `${patient.patient_name} ${patient.patient_last_name}`.trim();
      this.selectedPatientIdentification = patient.patient_identification || '';
      
      // Actualizar dispositivo asignado si existe
      if (patient.assigned_device && patient.assigned_device.id) {
        // Mostrar el nombre del dispositivo en el campo readonly
        this.selectedAssignedDevice = patient.assigned_device.name || 'No asignado';
        this.selectedAssignedDeviceId = patient.assigned_device.id;
        // Asignar device_id al formulario - asegurar que sea número
        this.form.device_id = Number(patient.assigned_device.id);
      } else {
        this.selectedAssignedDevice = 'No asignado';
        this.selectedAssignedDeviceId = null;
        this.form.device_id = null;
      }
      
      this.selectedAppointmentId = patient.appointment_id;
      this.selectedClinicalRegisterId = patient.clinical_register_id;
      this.form.appointment_id = patient.appointment_id;
      this.form.clinical_register_id = patient.clinical_register_id;
    } else {
      this.selectedPatientName = '';
      this.selectedPatientIdentification = '';
      this.selectedAssignedDevice = '';
      this.selectedAssignedDeviceId = null;
      this.selectedAppointmentId = '';
      this.selectedClinicalRegisterId = '';
      this.form.appointment_id = '';
      this.form.clinical_register_id = '';
      this.form.device_id = null;
    }
  }

  save() {
    if (!this.selectedPatientId || !this.form.appointment_id || !this.form.clinical_register_id) {
      alert('Selecciona un paciente.');
      return;
    }
    if (!this.form.device_id || !this.selectedAssignedDeviceId) {
      alert('El paciente seleccionado no tiene un dispositivo asignado.');
      return;
    }

    // Preparar el body con todos los campos requeridos, asegurando que device_id esté incluido
    const sessionData = {
      appointment_id: this.form.appointment_id,
      clinical_register_id: this.form.clinical_register_id,
      device_id: this.form.device_id, // Asegurar que device_id esté presente
      sampling_hz: this.form.sampling_hz || null,
      lead_config: this.form.lead_config || null
    };

    // Verificar que device_id se incluya correctamente
    console.log('Datos a enviar:', sessionData);

    this.ecgSessionService.createSession(sessionData).subscribe({
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


