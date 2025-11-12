import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { TriageService } from '../../../services/triage.service';
import { DoctorAppointmentService } from '../../../services/doctor-appointment.service';

@Component({
  selector: 'app-edit-triage',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './edit-triage.component.html',
  styleUrls: ['./edit-triage.component.scss']
})
export class EditTriageComponent implements OnInit {
  triageId: string | null = null;
  appointments: any[] = [];
  isReadOnly = false;
  triage: any = {
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
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(params => {
      this.isReadOnly = params.get('mode') === 'detalle';
    });

    this.route.params.subscribe(params => {
      this.triageId = params['id'];
      this.loadTriage();
    });
    this.loadAppointments();
  }

  loadAppointments() {
    this.doctorAppointmentService.getAppointments().subscribe({
      next: (res) => {
        this.appointments = res.appointments || [];
      },
      error: (err) => console.error('Error cargando citas:', err)
    });
  }

  loadTriage() {
    if (this.triageId) {
      this.triageService.getTriageById(this.triageId).subscribe({
        next: (res) => {
          const t = res.clinical;
          if (t) {
            this.triage = {
              appointment_id: t.appointment_id,
              smoker: t.smoker || false,
              drinker: t.drinker || false,
              congenital_diseases: t.congenital_diseases || '',
              allergies: t.allergies || '',
              height_cm: t.height_cm,
              weight_kg: t.weight_kg,
              practice_sport: t.practice_sport || false,
              consult_type: t.consult_type || '',
              summary: t.summary || ''
            };
            this.cdr.detectChanges();
          }
        },
        error: (err) => console.error('Error cargando triage:', err)
      });
    }
  }

  updateTriage() {
    if (this.isReadOnly) {
      return;
    }
    if (this.triageId) {
      this.triageService.updateTriage(this.triageId, this.triage).subscribe({
        next: () => {
          alert('Triage actualizado exitosamente.');
          this.router.navigate(['/triages']);
        },
        error: (err) => {
          console.error('Error actualizando triage:', err);
          alert(err.error?.error || 'Hubo un error al actualizar el triage.');
        }
      });
    }
  }

  goBack() {
    this.router.navigate(['/triages']);
  }
}

