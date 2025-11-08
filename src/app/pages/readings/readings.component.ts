import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { EcgReadingsService } from '../../services/ecg-readings.service';
import { EcgSessionService } from '../../services/ecg-session.service';

@Component({
  selector: 'app-readings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './readings.component.html',
  styleUrls: ['./readings.component.scss']
})
export class ReadingsComponent implements OnInit {
  readings: any[] = [];
  filteredReadings: any[] = [];
  filterText = '';
  loading = false;
  hasActiveSessions = false;
  errorMessage: string | null = null;

  constructor(
    private router: Router,
    private cdr: ChangeDetectorRef,
    private ecgReadingsService: EcgReadingsService,
    private ecgSessionService: EcgSessionService
  ) {}

  ngOnInit(): void {
    this.checkActiveSessions();
  }

  checkActiveSessions() {
    // Verificar si hay sesiones activas antes de cargar lecturas
    this.ecgSessionService.getSessions().subscribe({
      next: (res) => {
        const sessions = res.ecg_sessions || [];
        this.hasActiveSessions = sessions.length > 0;
        
        if (this.hasActiveSessions) {
          this.loadReadings();
        } else {
          this.errorMessage = 'No se puede acceder a las lecturas ECG porque no existe una sesión activa.';
        }
      },
      error: (err) => {
        console.error('Error verificando sesiones:', err);
        this.errorMessage = 'Error al verificar sesiones activas.';
      }
    });
  }

  loadReadings() {
    this.loading = true;
    this.errorMessage = null;
    
    this.ecgReadingsService.getReadings().subscribe({
      next: (res) => {
        // El backend devuelve: { ok: true, readings: [...] }
        this.readings = res.readings || [];
        this.filteredReadings = [...this.readings];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error cargando lecturas:', err);
        this.loading = false;
        this.errorMessage = err.error?.error || 'Error al cargar lecturas ECG.';
        this.cdr.detectChanges();
      }
    });
  }

  applyFilter() {
    const text = this.filterText.toLowerCase();
    this.filteredReadings = this.readings.filter((r: any) => {
      return (
        (r.patient_name || '').toLowerCase().includes(text) ||
        (r.patient_identification || '').toLowerCase().includes(text) ||
        (r.doctor_name || '').toLowerCase().includes(text)
      );
    });
  }

  goToDetail(readingId: number) {
    this.router.navigate(['/lecturas/detalle', readingId]);
  }

  openCreate() {
    this.router.navigate(['/lecturas/crear']);
  }

  formatDate(dateString: string | null | undefined): string {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toISOString().split('T')[0];
    } catch {
      return dateString;
    }
  }
}


