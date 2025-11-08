// src/app/pages/readings/create-reading/create-reading.component.ts
// Página para crear una nueva lectura ECG
import { Component, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { EcgReadingsService } from '../../../services/ecg-readings.service';
import { UserService } from '../../../services/user.service';
import { EcgSessionService } from '../../../services/ecg-session.service';
import { EcgMonitorEmbeddedComponent } from './ecg-monitor/ecg-monitor';
 
@Component({
  selector: 'app-create-reading',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, EcgMonitorEmbeddedComponent], // No changes here, but for context
  templateUrl: './create-reading.component.html',
  styleUrls: ['./create-reading.component.scss'],
})
export class CreateReadingComponent implements OnDestroy, OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private ecgReadingsService = inject(EcgReadingsService);
  private userService = inject(UserService);
  private ecgSessionService = inject(EcgSessionService);
 
  @ViewChild(EcgMonitorEmbeddedComponent) ecgMonitor!: EcgMonitorEmbeddedComponent;
 
  patients: any[] = [];
 
  // Estados iniciales - dispositivo DESCONECTADO
  deviceConnected = false;
  isRecording = false;
  recordingTime = 0;
  recordingProgress = 0;
  private recordingInterval: any;
 
  // IDs para la grabación
  private currentSessionId: number | null = null;
 
  // Datos del ECG en tiempo real
  currentBPM = 0;
 
  lecturaForm = this.fb.group({
    patientId: ['', [Validators.required]],
    recordCount: ['', [Validators.required, Validators.min(1)]],
    observations: ['']
  });
 
  ngOnInit(): void {
    this.loadPatients();
  }
 
  // Cargar pacientes REALES desde el backend
  loadPatients(): void {
    this.userService.getUsers().subscribe({
      next: (response: any) => {
        console.log('Respuesta de usuarios:', response);
       
        // Filtrar solo pacientes (role_id = 2 o role.code = 'patient')
        if (response.success && Array.isArray(response.users)) {
          this.patients = response.users.filter((user: any) =>
            user.role_id === 4 || user.role?.code === 'patient'
          );
        } else if (Array.isArray(response)) {
          this.patients = response.filter((user: any) =>
            user.role_id === 4 || user.role?.code === 'patient'
          );
        } else {
          console.error('Formato inesperado:', response);
          this.patients = [];
        }
       
        console.log('Pacientes cargados:', this.patients.length);
      },
      error: (error: any) => {
        console.error('Error cargando usuarios:', error);
        this.patients = [];
      }
    });
  }
 
  // Conectar dispositivo ECG - AHORA CON STREAMING REAL
  connectDevice(): void {
    this.deviceConnected = true;
   
    // Conectar el monitor ECG embebido
    setTimeout(() => {
      if (this.ecgMonitor) {
        this.ecgMonitor.connect();
      }
    }, 100);
   
    console.log('Dispositivo ECG conectado - Stream activo');
  }
 
  // Desconectar dispositivo ECG
  disconnectDevice(): void {
    this.deviceConnected = false;
    this.isRecording = false;
    this.stopRecording();
   
    // Desconectar el monitor ECG
    if (this.ecgMonitor) {
      this.ecgMonitor.disconnect();
    }
   
    console.log('Dispositivo ECG desconectado');
  }
 
  // Recibir datos del monitor ECG
  onEcgDataReceived(data: any): void {
    this.currentBPM = data.bpm;
    console.log('Datos ECG recibidos - BPM:', this.currentBPM);
   
    // Aquí puedes usar los datos si los necesitas para algo más
    // Por ejemplo: validaciones, alerts automáticas, etc.
  }
 
  // Iniciar grabación - AHORA CON BACKEND REAL
  startRecording(): void {
    if (!this.deviceConnected) {
      alert('Primero conecta el dispositivo ECG');
      return;
    }
 
    // Obtener patientId del formulario
    const patientId = this.lecturaForm.get('patientId')?.value;
    if (!patientId) {
      alert('Selecciona un paciente primero');
      return;
    }
 
    // TODO: Obtener appointment_id y clinical_register_id basado en el paciente
    const sessionData = {
      appointment_id: 1, // Reemplazar con lógica real
      clinical_register_id: 1, // Reemplazar con lógica real
      device_id: 1, // ID del dispositivo en BD
      lead_config: 'II'
    };
 
    this.ecgSessionService.createSession(sessionData).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.isRecording = true;
          this.recordingTime = 0;
          this.recordingProgress = 0;
          this.currentSessionId = response.sessionId;
         
          this.recordingInterval = setInterval(() => {
            this.recordingTime++;
            this.recordingProgress = (this.recordingTime / 60) * 100;
           
            if (this.recordingTime >= 60) {
              this.stopRecording();
              alert('Grabación completada - 60 segundos de datos capturados');
            }
          }, 1000);
         
          console.log('Grabación iniciada - Session ID:', this.currentSessionId);
        }
      },
      error: (error: any) => {
        alert('Error iniciando grabación: ' + error.message);
        console.error('Error startRecording:', error);
      }
    });
  }
 
  // Detener grabación - AHORA CON BACKEND REAL
  stopRecording(): void {
    this.isRecording = false;
    if (this.recordingInterval) {
      clearInterval(this.recordingInterval);
    }
   
    // Notificar al backend que se detuvo la grabación
    this.ecgSessionService.updateSession(String(this.currentSessionId), { status: 'stopped' }).subscribe({
      next: (response: any) => {
        console.log('Grabación detenida:', response);
      },
      error: (error: any) => {
        console.error('Error deteniendo grabación:', error);
      }
    });
  }
 
  // Crear lectura - AHORA GUARDA EN BD REAL
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
 
      // Guardar en base de datos REAL
      const readingData = {
        ecg_session_id: this.currentSessionId,
        observations: this.lecturaForm.value.observations || ''
      };
      this.ecgReadingsService.createReading(readingData).subscribe({
        next: (response: any) => {
          if (response.success) {
            console.log('Lectura guardada exitosamente:', response);
            alert('Lectura guardada exitosamente con análisis ECG');
            this.router.navigate(['/lecturas']);
          } else {
            alert('Error guardando lectura: ' + response.message);
          }
        },
        error: (error: any) => {
          alert('Error guardando lectura: ' + error.message);
          console.error('Error createLectura:', error);
        }
      });
 
    } else {
      this.lecturaForm.markAllAsTouched();
    }
  }
 
  // Cancelar
  cancel(): void {
    this.stopRecording();
    this.disconnectDevice();
    this.router.navigate(['/lecturas']);
  }
 
  // Helper methods
  getFullName(user: any): string {
    return `${user.name} ${user.last_name}`;
  }
 
  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
 
  ngOnDestroy(): void {
    this.stopRecording();
    this.disconnectDevice();
  }
}
 
