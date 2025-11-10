// src/app/pages/readings/create-reading/create-reading.component.ts
// Página para crear una nueva lectura ECG

import { Component, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { EcgReadingsService } from '../../../services/ecg-readings.service';
import { EcgSessionService } from '../../../services/ecg-session.service';
import { EcgMonitorEmbeddedComponent } from './ecg-monitor/ecg-monitor';
import { sample } from 'rxjs';

interface AssignedDevice {
  id: number;
  device_id: string | number;
  name: string;
}

interface AssignedDoctor {
  id: string;
  name: string;
  last_name: string;
  identification: string;
  email: string;
}

interface ActiveSessionInfo {
  id: number;
  status: string | null;
  lead_config: string | null;
  sampling_hz: number | null;
  device_id: number | string | null;
  started_at: string | null;
}

interface ActivePatient {
  patient_id: string;
  patient_name: string;
  patient_last_name: string;
  patient_identification: string;
  appointment_id: number;
  clinical_register_id: number;
  assigned_device: AssignedDevice | null;
  doctor: AssignedDoctor | null;
  active_session: ActiveSessionInfo | null;
}

@Component({
  selector: 'app-create-reading',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, EcgMonitorEmbeddedComponent],
  templateUrl: './create-reading.component.html',
  styleUrls: ['./create-reading.component.scss'],
})
export class CreateReadingComponent implements OnDestroy, OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private ecgReadingsService = inject(EcgReadingsService);
  private ecgSessionService = inject(EcgSessionService);

  @ViewChild(EcgMonitorEmbeddedComponent)
  ecgMonitor!: EcgMonitorEmbeddedComponent;

  patients: ActivePatient[] = [];
  selectedPatient: ActivePatient | null = null;
  doctorDisplay = '';
  deviceDisplay = '';
  sessionStatusDisplay = '';

  // Estado del dispositivo
  deviceConnected = false;
  isRecording = false;
  recordingTime = 0;
  recordingProgress = 0;
  private recordingInterval: any;

  // IDs para la grabación
  private currentSessionId: number | null = null;

  // BPM actual
  currentBPM = 0;

  // buffer de datos ECG grabados
  private collectedData: number[] = [];

  lecturaForm = this.fb.group({
    patientId: ['', [Validators.required]],
    recordCount: ['', [Validators.required, Validators.min(1)]],
    observations: [''],
  });

  ngOnInit(): void {
    this.loadActivePatients();
  }

  // Cargar pacientes con sesión activa
  loadActivePatients(): void {
    this.ecgSessionService.getActivePatients().subscribe({
      next: (response: any) => {
        const patients = response?.patients;
        if (Array.isArray(patients)) {
          this.patients = patients.map((patient: any) => ({
            ...patient,
            patient_id: String(patient.patient_id),
          }));
        } else {
          this.patients = [];
        }
      },
      error: (error: any) => {
        console.error('Error cargando pacientes con sesión activa:', error);
        this.patients = [];
      },
    });
  }

  onPatientSelected(patientId: string): void {
    if (!patientId) {
      this.selectedPatient = null;
      this.doctorDisplay = '';
      this.deviceDisplay = '';
      this.sessionStatusDisplay = '';
      this.currentSessionId = null;
      return;
    }

    this.selectedPatient =
      this.patients.find((patient) => patient.patient_id === patientId) || null;

    const doctor = this.selectedPatient?.doctor;
    this.doctorDisplay = doctor
      ? `${doctor.name ?? ''} ${doctor.last_name ?? ''}`.trim()
      : '';

    const device = this.selectedPatient?.assigned_device;
    this.deviceDisplay = device
      ? `${device.name ?? 'Dispositivo'} · ID ${device.device_id}`
      : 'Sin dispositivo asignado';

    const activeSession = this.selectedPatient?.active_session ?? null;
    this.currentSessionId = activeSession?.id ?? null;
    this.sessionStatusDisplay = activeSession
      ? this.mapSessionStatus(activeSession.status)
      : 'NO DISPONIBLE';
  }

  // Conectar dispositivo ECG
  connectDevice(): void {
    this.deviceConnected = true;

    // Conectar el monitor embebido
    setTimeout(() => {
      if (this.ecgMonitor) {
        this.ecgMonitor.connect();
      }
    }, 100);

    console.log('Dispositivo ECG conectado - Stream activo');
  }

  disconnectDevice(): void {
    this.deviceConnected = false;
    this.isRecording = false;
    this.stopRecording();

    if (this.ecgMonitor) {
      this.ecgMonitor.disconnect();
    }

    console.log('Dispositivo ECG desconectado');
  }

  // Recibir datos en tiempo real del monitor
  onEcgDataReceived(data: any): void {
    this.currentBPM = data.bpm;

    // Si estamos grabando, almacenar las muestras
    if (this.isRecording && data.samples && Array.isArray(data.samples)) {
      this.collectedData.push(...data.samples);
    }
  }

  // Iniciar grabación
  startRecording(): void {
    if (!this.deviceConnected) {
      alert('Primero conecta el dispositivo ECG');
      return;
    }

    // Limpiar buffer previo
    this.collectedData = [];

    const patientId = this.lecturaForm.get('patientId')?.value;
    if (!patientId) {
      alert('Selecciona un paciente primero');
      return;
    }

    if (!this.selectedPatient) {
      alert('No encontramos la información del paciente seleccionado');
      return;
    }

    if (!this.selectedPatient.active_session?.id) {
      alert('El paciente seleccionado no tiene una sesión ECG activa disponible.');
      return;
    }

    if (!this.selectedPatient.assigned_device) {
      alert('El paciente no tiene un dispositivo asignado en la sesión');
      return;
    }

    if (!this.currentSessionId) {
      alert('No se encontró la sesión activa del paciente.');
      return;
    }

    if (this.isRecording) {
      return;
    }

    this.isRecording = true;
    this.recordingTime = 0;
    this.recordingProgress = 0;
    this.sessionStatusDisplay = this.mapSessionStatus('recording');

    this.recordingInterval = setInterval(() => {
      this.recordingTime++;
      this.recordingProgress = (this.recordingTime / 10) * 100;

      if (this.recordingTime >= 10) {
        this.stopRecording();
        alert('Grabación completada - 10 segundos de datos capturados');
      }
    }, 1000);

    console.log('Grabación iniciada - Session ID:', this.currentSessionId);
  }

  stopRecording(): void {
    this.isRecording = false;
    if (this.recordingInterval) {
      clearInterval(this.recordingInterval);
    }

    // Solo cambia el estado de la sesión
    if (this.currentSessionId) {
      this.ecgSessionService
        .updateSession(String(this.currentSessionId), { status: 'stopped' })
        .subscribe({
          next: (response: any) => {
            this.sessionStatusDisplay = this.mapSessionStatus('stopped');
            console.log("Datos capturados:", this.collectedData.length, "muestras");
          },
          error: (error: any) => {
            console.error('Error deteniendo grabación:', error);
          },
        });
    }
  }

  // Crear la lectura y guardar datos reales en BD
  createLectura(): void {
    if (this.lecturaForm.valid) {
      if (!this.deviceConnected) {
        alert('Conecta el dispositivo ECG antes de guardar');
        return;
      }

      if (this.recordingTime === 0) {
        alert('Realiza una grabación antes de guardar');
        return;
      }

      if (!this.currentSessionId) {
        alert('Error: No hay sesión de grabación activa');
        return;
      }

      const recordCount = Number(this.lecturaForm.value.recordCount ?? 0);
      if (!Number.isFinite(recordCount) || recordCount < 1) {
        alert('El número de registros debe ser mayor o igual a 1');
        return;
      }

      const readingData = {
        ecg_session_id: this.currentSessionId,
        record_count: recordCount,
        observations: this.lecturaForm.value.observations,
        data: this.collectedData, // Se envía la señal capturada
        sample_rate: 250,
      };

      console.log('readingData:', readingData);

      this.ecgReadingsService.createReading(readingData).subscribe({
        next: (response: any) => {
          if (response?.ok) {
            alert('Lectura guardada exitosamente con análisis ECG');
            this.router.navigate(['/lecturas']);
          } else {
            alert('Error guardando lectura: ' + (response?.message || 'Respuesta inválida'));
          }
        },
        error: (error: any) => {
          alert('Error guardando lectura: ' + error.message);
          console.error('Error createLectura:', error);
        },
      });
    } else {
      this.lecturaForm.markAllAsTouched();
    }
  }

  cancel(): void {
    this.stopRecording();
    this.disconnectDevice();
    this.router.navigate(['/lecturas']);
  }

  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`;
  }

  private mapSessionStatus(status: string | null): string {
    if (!status) {
      return 'ACTIVA';
    }

    switch (status.toLowerCase()) {
      case 'active':
      case 'recording':
      case 'in_progress':
        return 'ACTIVA';
      case 'stopped':
      case 'inactive':
      case 'finalized':
      case 'finalizada':
        return 'DETENIDA';
      default:
        return status.toUpperCase();
    }
  }

  ngOnDestroy(): void {
    this.stopRecording();
    this.disconnectDevice();
  }
}
