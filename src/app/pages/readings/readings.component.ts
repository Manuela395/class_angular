import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { EcgReadingsService } from '../../services/ecg-readings.service';

interface EcgReadingGroup {
  patientName: string;
  patientIdentification: string;
  createdAt: string;
  recordCount: number;
  doctorName: string;
  readingIds: number[];
}

@Component({
  selector: 'app-readings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './readings.component.html',
  styleUrls: ['./readings.component.scss']
})
export class ReadingsComponent implements OnInit {
  readings: EcgReadingGroup[] = [];
  filteredReadings: EcgReadingGroup[] = [];
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
        const grouped = new Map<string, EcgReadingGroup>();

        (res.readings || []).forEach((reading: any) => {
          const patientName = this.composeFullName(reading.patient?.name, reading.patient?.last_name);
          const patientIdentification = reading.patient?.identification || 'N/A';
          const doctorName = this.composeFullName(reading.doctor?.name, reading.doctor?.last_name);
          const createdAt: string = reading.created_at;
          const dateKey = this.formatDate(createdAt);
          const key = `${patientIdentification}__${dateKey}`;
          const readingId = Number(reading.id);

          if (!grouped.has(key)) {
            grouped.set(key, {
              patientName,
              patientIdentification,
              createdAt,
              recordCount: 0,
              doctorName,
              readingIds: [],
            });
          }

          const group = grouped.get(key)!;
          if (!Number.isNaN(readingId)) {
            group.readingIds.push(readingId);
          }

          // Keep the most recent creation timestamp for ordering purposes
          if (group.createdAt && createdAt) {
            const currentTime = new Date(group.createdAt).getTime();
            const incomingTime = new Date(createdAt).getTime();
            if (!Number.isNaN(incomingTime) && incomingTime > currentTime) {
              group.createdAt = createdAt;
            }
          } else if (createdAt) {
            group.createdAt = createdAt;
          }

          if (group.doctorName === 'N/A' && doctorName !== 'N/A') {
            group.doctorName = doctorName;
          }

          group.recordCount = group.readingIds.length;
        });

        const items = Array.from(grouped.values()).sort((a, b) => {
          const dateA = new Date(a.createdAt).getTime();
          const dateB = new Date(b.createdAt).getTime();
          if (Number.isNaN(dateA) || Number.isNaN(dateB)) {
            return 0;
          }
          return dateB - dateA;
        });

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
        r.doctorName.toLowerCase().includes(text) ||
        this.formatDate(r.createdAt).includes(text)
      );
    });
  }

  goToDetail(group: EcgReadingGroup) {
    const firstReadingId = group.readingIds[0];
    if (!firstReadingId) {
      return;
    }

    const idsParam = group.readingIds.join(',');
    this.router.navigate(['/lecturas/detalle', firstReadingId], {
      queryParams: { ids: idsParam },
      state: { readingIds: group.readingIds }
    });
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