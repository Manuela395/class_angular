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
  patientOptions: { label: string; appointmentId: string }[] = [];
  selectedPatientName: string = '';
  selectedPatientIdentification: string = '';
  selectedPatientId: string = '';
  private readonly storageKeyAppointmentId = 'selected_triage_appointment_id';
  newTriage = {
    appointment_id: '',
    smoker: '',
    drinker: '',
    congenital_diseases: '',
    allergies: '',
    height_cm: null,
    weight_kg: null,
    practice_sport: '',
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
    
    // Validación: No permitir crear triage si no se ha seleccionado un paciente
    const savedAppointmentId = localStorage.getItem(this.storageKeyAppointmentId);
    if (!savedAppointmentId) {
      alert('Debe seleccionar un paciente en la vista anterior para crear un triage.');
      this.router.navigate(['/triages']);
      return;
    }
    
    this.newTriage.appointment_id = savedAppointmentId;
    this.loadAppointments();
  }

  loadPatientData() {
    if (!this.newTriage.appointment_id) {
      this.selectedPatientName = '';
      this.selectedPatientIdentification = '';
      this.selectedPatientId = '';
      return;
    }

    const appointment = this.appointments.find((apt: any) => String(apt.id) === String(this.newTriage.appointment_id));
    if (appointment && appointment.patient) {
      const p = appointment.patient;
      const fullName = [p.name, p.last_name].filter(Boolean).join(' ');
      this.selectedPatientName = fullName || '';
      this.selectedPatientIdentification = p.identification || '';
      this.selectedPatientId = p.id || '';
    } else {
      this.selectedPatientName = '';
      this.selectedPatientIdentification = '';
      this.selectedPatientId = '';
    }
  }

  loadAppointments() {
    console.log('Loading appointments...');
    this.doctorAppointmentService.getAppointments().subscribe({
      next: (res) => {
        console.log('Appointments loaded successfully:', res);
        this.appointments = res.appointments || [];
        console.log('Appointments array:', this.appointments);
        // Construir opciones de pacientes a partir de citas
        const map: Record<string, { label: string; appointmentId: string; date?: string }> = {};
        for (const apt of this.appointments) {
          const p = apt.patient || apt.appointment?.patient || {};
          const fullName = [p.name, p.last_name].filter(Boolean).join(' ');
          const label = `${fullName} – ${p.identification || ''}`.trim();
          const key = p.id || p.user_id || p.identification || String(apt.id);
          if (!key) continue;
          // Si el paciente ya existe, conserva la cita más reciente por fecha
          const current = map[key];
          const aptDate = apt.date_appointment || apt.date || '';
          if (!current || (aptDate && (!current.date || aptDate > (current.date || '')))) {
            map[key] = { label, appointmentId: String(apt.id), date: aptDate };
          }
        }
        this.patientOptions = Object.values(map).map(({ label, appointmentId }) => ({ label, appointmentId }));
        // Cargar automáticamente los datos del paciente seleccionado
        if (this.newTriage.appointment_id) {
          this.loadPatientData();
          // Validar que se cargó correctamente el paciente
          if (!this.selectedPatientId) {
            alert('No se pudo cargar la información del paciente seleccionado. Por favor, seleccione un paciente válido.');
            localStorage.removeItem(this.storageKeyAppointmentId);
            this.router.navigate(['/triages']);
          }
        }
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
    // Validación: No permitir crear triage si no hay paciente seleccionado
    if (!this.newTriage.appointment_id || !this.selectedPatientId) {
      alert('Debe seleccionar un paciente para crear un triage.');
      return;
    }

    // Convertir los valores de string (SI/NO) a boolean para el backend
    // Nota: allergies es TEXT en el backend, así que lo mantenemos como string
    const triageData = {
      ...this.newTriage,
      smoker: this.newTriage.smoker === 'SI' ? true : this.newTriage.smoker === 'NO' ? false : null,
      drinker: this.newTriage.drinker === 'SI' ? true : this.newTriage.drinker === 'NO' ? false : null,
      practice_sport: this.newTriage.practice_sport === 'SI' ? true : this.newTriage.practice_sport === 'NO' ? false : null,
      // allergies se mantiene como string (puede ser "SI", "NO", o cualquier texto)
    };

    this.triageService.createTriage(triageData).subscribe({
      next: (response) => {
        console.log('Triage creado:', response);
        alert('Triage creado exitosamente.');
        // Limpiar la selección del localStorage después de crear
        localStorage.removeItem(this.storageKeyAppointmentId);
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

