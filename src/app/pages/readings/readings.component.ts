import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { EcgReadingsService } from '../../services/ecg-readings.service';

interface ReadingEntry {
  id: number;
  createdAt: string | null;
}

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
        const grouped = new Map<
          string,
          {
            group: EcgReadingGroup;
            entries: ReadingEntry[];
          }
        >();

        (res.readings || []).forEach((reading: any) => {
          const patientName = this.composeFullName(reading.patient?.name, reading.patient?.last_name);
          const patientIdentification = reading.patient?.identification || 'N/A';
          const doctorName = this.composeFullName(reading.doctor?.name, reading.doctor?.last_name);
          const createdAt: string | null = reading.created_at ?? null;
          const dateKey = this.formatDate(createdAt);
          const key = `${patientIdentification}__${dateKey}`;
          const readingId = Number(reading.id);

          if (!grouped.has(key)) {
            grouped.set(key, {
              group: {
                patientName,
                patientIdentification,
                createdAt: createdAt ?? '',
                recordCount: 0,
                doctorName,
                readingIds: [],
              },
              entries: [],
            });
          }

          const groupData = grouped.get(key)!;
          const entry: ReadingEntry = {
            id: Number.isNaN(readingId) ? 0 : readingId,
            createdAt,
          };

          groupData.entries.push(entry);

          if (groupData.group.doctorName === 'N/A' && doctorName !== 'N/A') {
            groupData.group.doctorName = doctorName;
          }
        });

        const items = Array.from(grouped.values())
          .map(({ group, entries }) => {
            const sortedEntries = entries
              .filter((entry) => entry.id > 0)
              .sort((a, b) => {
                const timeA = a.createdAt ? new Date(a.createdAt).getTime() : Number.NEGATIVE_INFINITY;
                const timeB = b.createdAt ? new Date(b.createdAt).getTime() : Number.NEGATIVE_INFINITY;
                return timeA - timeB;
              });

            group.readingIds = sortedEntries.map((entry) => entry.id);
            group.recordCount = group.readingIds.length;

            if (sortedEntries.length > 0) {
              const latestEntry = sortedEntries[sortedEntries.length - 1];
              if (latestEntry.createdAt) {
                group.createdAt = latestEntry.createdAt;
              }
            }

            return group;
          })
          .sort((a, b) => {
            const dateAValue = Number.isNaN(new Date(a.createdAt).getTime())
              ? Number.NEGATIVE_INFINITY
              : new Date(a.createdAt).getTime();
            const dateBValue = Number.isNaN(new Date(b.createdAt).getTime())
              ? Number.NEGATIVE_INFINITY
              : new Date(b.createdAt).getTime();

            return dateBValue - dateAValue;
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