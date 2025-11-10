import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { EcgReadingsService } from '../../services/ecg-readings.service';

interface EcgReadingView {
  id: number;
  patientName: string;
  patientIdentification: string;
  createdAt: string;
  recordCount: number;
  doctorName: string;
}

@Component({
  selector: 'app-readings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './readings.component.html',
  styleUrls: ['./readings.component.scss']
})
export class ReadingsComponent implements OnInit {
  readings: EcgReadingView[] = [];
  filteredReadings: EcgReadingView[] = [];
  filterText = '';
  loading = false;
  errorMessage: string | null = null;

  constructor(
    private router: Router,
    private cdr: ChangeDetectorRef,
    private ecgReadingsService: EcgReadingsService
  ) {}

  ngOnInit(): void {
    this.loadReadings();
  }

  loadReadings() {
    this.loading = true;
    this.errorMessage = null;
    
    this.ecgReadingsService.getReadings().subscribe({
      next: (res) => {
        const items: EcgReadingView[] = (res.readings || []).map((reading: any) => ({
          id: reading.id,
          patientName: this.composeFullName(reading.patient?.name, reading.patient?.last_name),
          patientIdentification: reading.patient?.identification || 'N/A',
          createdAt: reading.created_at,
          recordCount: reading.record_count ?? 0,
          doctorName: this.composeFullName(reading.doctor?.name, reading.doctor?.last_name),
        }));

        this.readings = items;
        this.filteredReadings = [...items];
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
    this.filteredReadings = this.readings.filter((r) => {
      return (
        r.patientName.toLowerCase().includes(text) ||
        r.patientIdentification.toLowerCase().includes(text) ||
        r.doctorName.toLowerCase().includes(text)
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

  private composeFullName(name?: string, lastName?: string): string {
    const full = `${name || ''} ${lastName || ''}`.trim();
    return full.length > 0 ? full : 'N/A';
  }
}